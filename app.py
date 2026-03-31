"""
RFM Nexus - Flask Backend API

A clean, modular Flask application for RFM (Recency, Frequency, Monetary) analysis.
Provides endpoints for data upload, analysis, and report generation.

Architecture:
- Routes: HTTP request handlers
- Services: Business logic
- Models: Data structures and validation
- Utils: Helper functions
"""

import os
import sys
from pathlib import Path

# Add project root to path for imports
project_root = Path(__file__).parent
sys.path.insert(0, str(project_root))

from flask import Flask, render_template, request, jsonify, send_file
from flask_cors import CORS
from werkzeug.exceptions import BadRequest, InternalServerError
import logging
from datetime import datetime

from services.rfm_service import RFMService
from services.chart_service import ChartService
from services.report_service import ReportService
from utils.data_utils import convert_numpy_types, validate_file_extension
from models.responses import APIResponse, ErrorResponse

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Flask application factory
def create_app(config_name='development'):
    """Application factory pattern for creating Flask app."""
    
    app = Flask(__name__, 
                template_folder='../dist',
                static_folder='../dist',
                static_url_path='')
    
    # Configuration
    app.config['UPLOAD_FOLDER'] = os.path.join(project_root, 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = 100 * 1024 * 1024  # 100MB
    app.config['SECRET_KEY'] = os.environ.get('SECRET_KEY', 'dev-secret-key')
    
    # Enable CORS for frontend communication
    CORS(app, resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://localhost:4173"],
            "methods": ["GET", "POST", "OPTIONS"],
            "allow_headers": ["Content-Type"]
        }
    })
    
    # Ensure upload directory exists
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True)
    
    # Initialize services
    rfm_service = RFMService()
    chart_service = ChartService()
    report_service = ReportService()
    
    # =========================================================================
    # Error Handlers
    # =========================================================================
    
    @app.errorhandler(BadRequest)
    def handle_bad_request(e):
        logger.warning(f"Bad request: {str(e)}")
        return jsonify(ErrorResponse(
            success=False,
            error="Bad request",
            details=str(e)
        ).to_dict()), 400
    
    @app.errorhandler(InternalServerError)
    def handle_server_error(e):
        logger.error(f"Server error: {str(e)}")
        return jsonify(ErrorResponse(
            success=False,
            error="Internal server error",
            details="An unexpected error occurred. Please try again."
        ).to_dict()), 500
    
    @app.errorhandler(413)
    def handle_file_too_large(e):
        return jsonify(ErrorResponse(
            success=False,
            error="File too large",
            details="Maximum file size is 100MB"
        ).to_dict()), 413
    
    # =========================================================================
    # Routes
    # =========================================================================
    
    @app.route('/')
    def index():
        """Serve the main application."""
        return render_template('index.html')
    
    @app.route('/health')
    def health_check():
        """Health check endpoint for monitoring."""
        return jsonify(APIResponse(
            success=True,
            data={
                'status': 'healthy',
                'timestamp': datetime.now().isoformat(),
                'version': '2.0.0'
            }
        ).to_dict())
    
    @app.route('/api/upload', methods=['POST'])
    def upload_file():
        """
        Upload and analyze CSV file.
        
        Expected form data:
            - file: CSV file with columns: CustomerID, InvoiceDate, InvoiceNo, Quantity, UnitPrice
        
        Returns:
            JSON with analysis results including segments, charts, and recommendations
        """
        logger.info("Received file upload request")
        
        # Validate request
        if 'file' not in request.files:
            logger.warning("No file in request")
            return jsonify(ErrorResponse(
                success=False,
                error="No file uploaded"
            ).to_dict()), 400
        
        file = request.files['file']
        
        if file.filename == '':
            logger.warning("Empty filename")
            return jsonify(ErrorResponse(
                success=False,
                error="No file selected"
            ).to_dict()), 400
        
        # Validate file extension
        if not validate_file_extension(file.filename, ['.csv']):
            logger.warning(f"Invalid file type: {file.filename}")
            return jsonify(ErrorResponse(
                success=False,
                error="Invalid file type",
                details="Please upload a CSV file"
            ).to_dict()), 400
        
        try:
            # Save uploaded file
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            filename = f"upload_{timestamp}_{file.filename}"
            filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
            file.save(filepath)
            
            logger.info(f"File saved: {filepath}")
            
            # Perform RFM analysis
            results = rfm_service.analyze(filepath)
            
            # Generate charts for both themes
            charts_dark = chart_service.generate_charts(results, theme='dark')
            charts_light = chart_service.generate_charts(results, theme='light')
            
            # Combine charts
            results['charts'] = {
                **{f'{k}_dark': v for k, v in charts_dark.items()},
                **{f'{k}_light': v for k, v in charts_light.items()}
            }
            
            # Clean up uploaded file
            try:
                os.remove(filepath)
                logger.info(f"Cleaned up: {filepath}")
            except OSError as e:
                logger.warning(f"Failed to clean up file: {e}")
            
            # Convert numpy types for JSON serialization
            response_data = convert_numpy_types(results)
            
            logger.info("Analysis completed successfully")
            
            return jsonify(APIResponse(
                success=True,
                data=response_data
            ).to_dict())
            
        except Exception as e:
            logger.error(f"Analysis failed: {str(e)}", exc_info=True)
            return jsonify(ErrorResponse(
                success=False,
                error="Analysis failed",
                details=str(e)
            ).to_dict()), 500
    
    @app.route('/api/download', methods=['POST'])
    def download_results():
        """
        Download full RFM analysis data as CSV.
        
        Expected JSON body:
            - rfm_data: Array of RFM records
        
        Returns:
            CSV file download
        """
        try:
            data = request.get_json()
            
            if not data or 'rfm_data' not in data:
                return jsonify(ErrorResponse(
                    success=False,
                    error="No data provided"
                ).to_dict()), 400
            
            csv_bytes = rfm_service.to_csv(data['rfm_data'])
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M')
            filename = f'rfm_analysis_results_{timestamp}.csv'
            
            return send_file(
                csv_bytes,
                mimetype='text/csv',
                as_attachment=True,
                download_name=filename
            )
            
        except Exception as e:
            logger.error(f"Download failed: {str(e)}")
            return jsonify(ErrorResponse(
                success=False,
                error="Download failed",
                details=str(e)
            ).to_dict()), 500
    
    @app.route('/api/download_segment', methods=['POST'])
    def download_segment():
        """
        Download specific segment data as CSV.
        
        Expected JSON body:
            - segment: Segment name
            - rfm_data: Array of RFM records
        
        Returns:
            CSV file download
        """
        try:
            data = request.get_json()
            
            if not data or 'rfm_data' not in data or 'segment' not in data:
                return jsonify(ErrorResponse(
                    success=False,
                    error="Missing required parameters"
                ).to_dict()), 400
            
            segment_name = data['segment']
            csv_bytes = rfm_service.segment_to_csv(data['rfm_data'], segment_name)
            
            timestamp = datetime.now().strftime('%Y%m%d_%H%M')
            filename = f'rfm_segment_{segment_name.replace(" ", "_")}_{timestamp}.csv'
            
            return send_file(
                csv_bytes,
                mimetype='text/csv',
                as_attachment=True,
                download_name=filename
            )
            
        except ValueError as e:
            return jsonify(ErrorResponse(
                success=False,
                error=str(e)
            ).to_dict()), 404
            
        except Exception as e:
            logger.error(f"Segment download failed: {str(e)}")
            return jsonify(ErrorResponse(
                success=False,
                error="Download failed",
                details=str(e)
            ).to_dict()), 500
    
    @app.route('/api/download_report', methods=['POST'])
    def download_report():
        """
        Generate and download comprehensive HTML report.
        
        Expected JSON body:
            - results: Complete analysis results
        
        Returns:
            JSON with report HTML and filename
        """
        try:
            data = request.get_json()
            
            if not data or 'results' not in data:
                return jsonify(ErrorResponse(
                    success=False,
                    error="No results data provided"
                ).to_dict()), 400
            
            report_html = report_service.generate(data['results'])
            filename = f'rfm_report_{datetime.now().strftime("%Y%m%d_%H%M")}.html'
            
            return jsonify(APIResponse(
                success=True,
                data={
                    'report_html': report_html,
                    'filename': filename
                }
            ).to_dict())
            
        except Exception as e:
            logger.error(f"Report generation failed: {str(e)}")
            return jsonify(ErrorResponse(
                success=False,
                error="Report generation failed",
                details=str(e)
            ).to_dict()), 500
    
    # Legacy routes for backward compatibility
    @app.route('/upload', methods=['POST'])
    def legacy_upload():
        """Legacy upload endpoint."""
        return upload_file()
    
    @app.route('/download', methods=['POST'])
    def legacy_download():
        """Legacy download endpoint."""
        return download_results()
    
    @app.route('/download_segment', methods=['POST'])
    def legacy_download_segment():
        """Legacy segment download endpoint."""
        return download_segment()
    
    @app.route('/download_report', methods=['POST'])
    def legacy_download_report():
        """Legacy report download endpoint."""
        return download_report()
    
    return app


# Create application instance
app = create_app()

if __name__ == '__main__':
    print("=" * 60)
    print("RFM Nexus - Advanced Customer Intelligence Platform")
    print("=" * 60)
    print("Starting server...")
    print("Open your browser and go to: http://localhost:5000")
    print("Press Ctrl+C to stop")
    print("=" * 60)
    
    app.run(
        debug=True,
        host='0.0.0.0',
        port=5000,
        threaded=True
    )

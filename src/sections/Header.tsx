/**
 * Header Component
 * 
 * Main application header with:
 * - Logo and branding
 * - Theme toggle switch
 * - GitHub link
 * - Responsive design
 * - Accessibility features
 */

import { useTheme } from '@/hooks/useTheme';
import { Moon, Sun, Github, BarChart3 } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';

export function Header() {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <header 
      className="sticky top-0 z-40 w-full glass-card border-b"
      role="banner"
    >
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo & Brand */}
          <motion.div 
            className="flex items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative">
              <BarChart3 
                className="w-8 h-8"
                style={{ color: 'var(--tech-accent-cyan)' }}
              />
              <div 
                className="absolute inset-0 blur-lg opacity-50"
                style={{ background: 'var(--tech-accent-cyan)' }}
              />
            </div>
            <div>
              <h1 className="text-2xl font-bold gradient-text">
                RFM Nexus
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Advanced Customer Intelligence
              </p>
            </div>
          </motion.div>

          {/* Actions */}
          <motion.div 
            className="flex items-center gap-4"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            {/* Theme Toggle */}
            <div 
              className="flex items-center gap-2 glass-card px-3 py-2"
              role="group"
              aria-label="Theme toggle"
            >
              <Sun 
                className={`w-4 h-4 transition-colors ${!isDark ? 'text-amber-500' : 'text-muted-foreground'}`}
                aria-hidden="true"
              />
              <Switch
                checked={isDark}
                onCheckedChange={toggleTheme}
                aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
                className="data-[state=checked]:bg-[var(--tech-accent-cyan)]"
              />
              <Moon 
                className={`w-4 h-4 transition-colors ${isDark ? 'text-[var(--tech-accent-cyan)]' : 'text-muted-foreground'}`}
                aria-hidden="true"
              />
            </div>

            {/* GitHub Link */}
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-lg transition-all duration-300 hover:bg-[var(--tech-hover-bg)] focus-ring"
              aria-label="View source on GitHub"
            >
              <Github className="w-5 h-5 text-muted-foreground hover:text-[var(--tech-accent-cyan)] transition-colors" />
            </a>
          </motion.div>
        </div>
      </div>
    </header>
  );
}

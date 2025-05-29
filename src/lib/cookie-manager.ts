export interface CookiePreferences {
	essential: boolean
	analytics: boolean
	functional: boolean
}

export type CookieCategory = keyof CookiePreferences

export const DEFAULT_PREFERENCES: CookiePreferences = {
	essential: true,
	analytics: false,
	functional: false,
}

// Cookie configuration
export const COOKIE_CONFIG = {
	CONSENT_KEY: 'polieats_cookie_consent',
	PREFERENCES_KEY: 'polieats_cookie_preferences',
	DEFAULT_EXPIRES_DAYS: 365,
} as const

// Custom event names for cookie preference changes
export const COOKIE_EVENTS = {
	PREFERENCES_CHANGED: 'cookiePreferencesChanged',
	PREFERENCES_CLEARED: 'cookiePreferencesCleared',
} as const

// Actual cookies used in the application
export const ACTUAL_COOKIES = {
	essential: [
		{
			name: 'better-auth.session_token',
			description: 'Armazena o token de sessão do usuário',
			purpose: 'Autenticação e segurança',
		},
		{
			name: 'polieats_cookie_consent',
			description: 'Armazena seu consentimento para cookies',
			purpose: 'Gerenciamento de consentimento',
		},
		{
			name: 'polieats_cookie_preferences',
			description: 'Armazena suas preferências de cookies',
			purpose: 'Gerenciamento de preferências',
		},
	],
	functional: [
		{
			name: 'theme',
			description: 'Armazena sua preferência de tema (claro/escuro)',
			purpose: 'Personalização da interface',
		},
		{
			name: 'language',
			description: 'Armazena sua preferência de idioma',
			purpose: 'Localização',
		},
	],
	analytics: [
		{
			name: '_ga',
			description: 'Google Analytics - identifica usuários únicos',
			purpose: 'Análise de tráfego e comportamento',
		},
		{
			name: '_ga_*',
			description: 'Google Analytics 4 - coleta dados de eventos',
			purpose: 'Métricas detalhadas de uso',
		},
	],
}

// Core cookie utilities
export const cookieUtils = {
	set: (
		name: string,
		value: string,
		days = COOKIE_CONFIG.DEFAULT_EXPIRES_DAYS
	): void => {
		if (typeof document === 'undefined') return

		const expires = new Date()
		expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)
		document.cookie = `${name}=${value};expires=${expires.toUTCString()};path=/;SameSite=Lax;Secure=${location.protocol === 'https:'}`
	},

	get: (name: string): string | null => {
		if (typeof document === 'undefined') return null

		const nameEQ = `${name}=`
		const cookies = document.cookie.split(';')

		for (let cookie of cookies) {
			cookie = cookie.trim()
			if (cookie.indexOf(nameEQ) === 0) {
				return cookie.substring(nameEQ.length)
			}
		}
		return null
	},

	remove: (name: string): void => {
		if (typeof document === 'undefined') return
		document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`
	},

	exists: (name: string): boolean => {
		return cookieUtils.get(name) !== null
	},
}

// Cookie preference management
export const cookieManager = {
	hasConsented: (): boolean => {
		return (
			cookieUtils.get(COOKIE_CONFIG.CONSENT_KEY) === 'true' ||
			(typeof localStorage !== 'undefined' &&
				localStorage.getItem(COOKIE_CONFIG.CONSENT_KEY) === 'true')
		)
	},

	savePreferences: (preferences: CookiePreferences): void => {
		// Save to cookies
		cookieUtils.set(COOKIE_CONFIG.PREFERENCES_KEY, JSON.stringify(preferences))
		cookieUtils.set(COOKIE_CONFIG.CONSENT_KEY, 'true')

		// Backup to localStorage
		if (typeof localStorage !== 'undefined') {
			localStorage.setItem(
				COOKIE_CONFIG.PREFERENCES_KEY,
				JSON.stringify(preferences)
			)
			localStorage.setItem(COOKIE_CONFIG.CONSENT_KEY, 'true')
		}

		// Trigger analytics initialization if enabled
		if (preferences.analytics) {
			cookieManager.initializeAnalytics(preferences)
		}

		// Dispatch custom event to notify other components
		if (typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent(COOKIE_EVENTS.PREFERENCES_CHANGED, {
					detail: preferences,
				})
			)
		}

		// Note: Marketing cookies are not used in this application
	},

	loadPreferences: (): CookiePreferences => {
		try {
			// Try cookie first
			const cookiePrefs = cookieUtils.get(COOKIE_CONFIG.PREFERENCES_KEY)
			if (cookiePrefs) {
				return { ...DEFAULT_PREFERENCES, ...JSON.parse(cookiePrefs) }
			}

			// Fallback to localStorage
			if (typeof localStorage !== 'undefined') {
				const localPrefs = localStorage.getItem(COOKIE_CONFIG.PREFERENCES_KEY)
				if (localPrefs) {
					return { ...DEFAULT_PREFERENCES, ...JSON.parse(localPrefs) }
				}
			}
		} catch (error) {
			console.error('Error loading cookie preferences:', error)
		}

		return DEFAULT_PREFERENCES
	},

	clearAllPreferences: (): void => {
		cookieUtils.remove(COOKIE_CONFIG.CONSENT_KEY)
		cookieUtils.remove(COOKIE_CONFIG.PREFERENCES_KEY)

		if (typeof localStorage !== 'undefined') {
			localStorage.removeItem(COOKIE_CONFIG.CONSENT_KEY)
			localStorage.removeItem(COOKIE_CONFIG.PREFERENCES_KEY)
		}

		// Dispatch custom event to notify other components
		if (typeof window !== 'undefined') {
			window.dispatchEvent(
				new CustomEvent(COOKIE_EVENTS.PREFERENCES_CLEARED, {
					detail: DEFAULT_PREFERENCES,
				})
			)
		}
	},

	// Helper to subscribe to preference changes
	onPreferencesChange: (
		callback: (preferences: CookiePreferences) => void
	): (() => void) => {
		if (typeof window === 'undefined') return () => {}

		const handleChange = (event: CustomEvent) => {
			callback(event.detail)
		}

		window.addEventListener(
			COOKIE_EVENTS.PREFERENCES_CHANGED,
			handleChange as EventListener
		)
		window.addEventListener(
			COOKIE_EVENTS.PREFERENCES_CLEARED,
			handleChange as EventListener
		)

		// Return cleanup function
		return () => {
			window.removeEventListener(
				COOKIE_EVENTS.PREFERENCES_CHANGED,
				handleChange as EventListener
			)
			window.removeEventListener(
				COOKIE_EVENTS.PREFERENCES_CLEARED,
				handleChange as EventListener
			)
		}
	},

	// Analytics integration
	initializeAnalytics: (preferences: CookiePreferences): void => {
		if (!preferences.analytics || typeof window === 'undefined') return

		console.log('🔍 Analytics cookies enabled')

		// Google Analytics 4 integration
		// Uncomment and configure with your GA4 tracking ID
		/*
    const script = document.createElement('script')
    script.async = true
    script.src = `https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_TRACKING_ID}`
    document.head.appendChild(script)

    window.dataLayer = window.dataLayer || []
    function gtag(...args: any[]) {
      window.dataLayer.push(args)
    }
    gtag('js', new Date())
    gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
      page_title: document.title,
      page_location: window.location.href,
    })
    */
	},

	// Marketing integration - REMOVED since no marketing cookies are used
	initializeMarketing: (preferences: CookiePreferences): void => {
		// Marketing cookies are not currently implemented in this application
		console.log('ℹ️ Marketing cookies are not implemented in this application')
	},

	// Category-specific helpers
	canUseCategory: (category: CookieCategory): boolean => {
		if (category === 'essential') return true

		const preferences = cookieManager.loadPreferences()
		return preferences[category] === true
	},

	// Development helpers
	debugInfo: (): void => {
		if (process.env.NODE_ENV !== 'development') return

		console.group('🍪 Cookie Debug Info')
		console.log('Has consented:', cookieManager.hasConsented())
		console.log('Preferences:', cookieManager.loadPreferences())
		console.log('All cookies:', document.cookie)
		console.groupEnd()
	},
}

// React hooks for cookie management
export const useCookiePreferences = () => {
	if (typeof window === 'undefined') {
		return {
			preferences: DEFAULT_PREFERENCES,
			hasConsented: false,
			updatePreferences: () => {},
			clearPreferences: () => {},
		}
	}

	const preferences = cookieManager.loadPreferences()
	const hasConsented = cookieManager.hasConsented()

	return {
		preferences,
		hasConsented,
		updatePreferences: cookieManager.savePreferences,
		clearPreferences: cookieManager.clearAllPreferences,
	}
}

// Google Analytics tracking functions (when enabled)
export const analytics = {
	pageView: (url: string): void => {
		if (!cookieManager.canUseCategory('analytics')) return

		// Google Analytics pageview
		if (typeof window !== 'undefined' && (window as any).gtag) {
			;(window as any).gtag('config', process.env.NEXT_PUBLIC_GA_TRACKING_ID, {
				page_path: url,
			})
		}
	},

	event: (
		action: string,
		category?: string,
		label?: string,
		value?: number
	): void => {
		if (!cookieManager.canUseCategory('analytics')) return

		// Google Analytics event
		if (typeof window !== 'undefined' && (window as any).gtag) {
			;(window as any).gtag('event', action, {
				event_category: category,
				event_label: label,
				value: value,
			})
		}
	},
}

export default cookieManager

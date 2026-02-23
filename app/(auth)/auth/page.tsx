'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2, Briefcase } from 'lucide-react'

type Mode = 'connexion' | 'inscription' | 'recruteur'

export default function AuthPage() {
  const [mode, setMode] = useState<Mode>('connexion')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  function switchMode(m: Mode) {
    setMode(m)
    setError(null)
    setSuccess(null)
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setLoading(true)

    try {
      if (mode === 'inscription') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/onboarding`,
          },
        })
        if (error) throw error
        setSuccess(
          'Compte créé ! Vérifie ta boîte email pour confirmer ton inscription.'
        )
      } else if (mode === 'recruteur') {
        // Inscription recruteur — le rôle est passé en métadonnées
        // Le trigger Supabase handle_new_user() lit raw_user_meta_data->>'role'
        // et crée le profil avec role='recruteur' automatiquement
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { role: 'recruteur' },
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        })
        if (error) throw error
        setSuccess(
          'Compte recruteur créé ! Vérifie ta boîte email puis connecte-toi.'
        )
      } else {
        // Connexion
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        // Laisser /dashboard faire le dispatch par rôle (lecture serveur)
        router.push('/dashboard')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      if (message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.')
      } else if (message.includes('Email not confirmed')) {
        setError('Confirme ton email avant de te connecter.')
      } else if (message.includes('Password should be')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.')
      } else if (message.includes('already registered')) {
        setError('Un compte existe déjà avec cet email.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

  const formId = mode === 'recruteur' ? 'form-recruteur' : mode === 'inscription' ? 'form-inscription' : 'form-connexion'

  return (
    <div className="min-h-screen bg-[#F8F9FA] flex flex-col items-center justify-center px-4 py-12">
      {/* Logo */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-[#1A2742]">
          BAARA <span className="text-[#E9A23B]">Skills</span>
        </h1>
        <p className="text-[#6B7280] text-sm mt-1">
          Forge ton métier. Prouve-le.
        </p>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-xl shadow-sm border border-[#E5E7EB] p-6">

        {/* Tabs apprenant — role="tablist" pour lecteurs d'écran */}
        <div role="tablist" aria-label="Type de compte" className="flex bg-[#F8F9FA] rounded-lg p-1 mb-4">
          <button
            role="tab"
            aria-selected={mode === 'connexion'}
            aria-controls={formId}
            onClick={() => switchMode('connexion')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
              mode === 'connexion'
                ? 'bg-white text-[#1A2742] shadow-sm'
                : 'text-[#6B7280] hover:text-[#1A2742]'
            }`}
          >
            Connexion
          </button>
          <button
            role="tab"
            aria-selected={mode === 'inscription'}
            aria-controls={formId}
            onClick={() => switchMode('inscription')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
              mode === 'inscription'
                ? 'bg-white text-[#1A2742] shadow-sm'
                : 'text-[#6B7280] hover:text-[#1A2742]'
            }`}
          >
            Inscription
          </button>
        </div>

        {/* Bouton recruteur */}
        <button
          type="button"
          onClick={() => switchMode('recruteur')}
          aria-pressed={mode === 'recruteur'}
          className={`w-full flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg border transition-colors min-h-[44px] mb-5 ${
            mode === 'recruteur'
              ? 'border-[#E9A23B] bg-orange-50 text-[#E9A23B]'
              : 'border-[#E5E7EB] text-[#6B7280] hover:border-[#E9A23B]/50 hover:text-[#E9A23B]'
          }`}
        >
          <Briefcase size={16} aria-hidden="true" />
          {mode === 'recruteur' ? 'Inscription Recruteur' : 'Je suis recruteur / entreprise'}
        </button>

        {/* Label contextuel recruteur */}
        {mode === 'recruteur' && (
          <p className="text-xs text-[#6B7280] bg-orange-50 border border-orange-100 rounded-lg px-3 py-2 mb-4">
            Créez un compte pour accéder aux profils certifiés de nos apprenants.
          </p>
        )}

        <form
          id={formId}
          onSubmit={handleSubmit}
          className="flex flex-col gap-4"
          aria-label={
            mode === 'connexion'
              ? 'Formulaire de connexion'
              : mode === 'recruteur'
              ? 'Formulaire d\'inscription recruteur'
              : 'Formulaire d\'inscription apprenant'
          }
          noValidate
        >
          {/* Email */}
          <div>
            <label
              htmlFor="auth-email"
              className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
            >
              Adresse email
            </label>
            <input
              id="auth-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              autoComplete="email"
              aria-required="true"
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label
              htmlFor="auth-password"
              className="block text-sm font-medium text-[#1A1A1A] mb-1.5"
            >
              Mot de passe
              {mode !== 'connexion' && (
                <span className="text-[#6B7280] font-normal ml-1">(6 caractères minimum)</span>
              )}
            </label>
            <div className="relative">
              <input
                id="auth-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                autoComplete={mode === 'connexion' ? 'current-password' : 'new-password'}
                aria-required="true"
                minLength={mode !== 'connexion' ? 6 : undefined}
                className="w-full px-3 py-2.5 pr-12 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                aria-pressed={showPassword}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280] hover:text-[#1A1A1A] min-w-[44px] min-h-[44px] flex items-center justify-center"
              >
                {showPassword
                  ? <EyeOff size={18} aria-hidden="true" />
                  : <Eye size={18} aria-hidden="true" />
                }
              </button>
            </div>
          </div>

          {/* Erreur — role="alert" pour annonce immédiate aux lecteurs d'écran */}
          {error && (
            <p
              role="alert"
              aria-live="assertive"
              className="text-sm text-[#EF4444] bg-red-50 px-3 py-2 rounded-lg"
            >
              {error}
            </p>
          )}

          {/* Succès — role="status" pour annonce non-urgente */}
          {success && (
            <p
              role="status"
              aria-live="polite"
              className="text-sm text-[#10B981] bg-green-50 px-3 py-2 rounded-lg"
            >
              {success}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            aria-busy={loading}
            className={`w-full py-3 rounded-lg font-semibold min-h-[44px] transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2 text-white ${
              mode === 'recruteur'
                ? 'bg-[#E9A23B] hover:bg-[#E9A23B]/90'
                : 'bg-[#1A2742] hover:bg-[#1A2742]/90'
            }`}
          >
            {loading && <Loader2 size={18} className="animate-spin" aria-hidden="true" />}
            {loading
              ? 'Chargement…'
              : mode === 'connexion'
              ? 'Se connecter'
              : mode === 'recruteur'
              ? 'Créer mon compte recruteur'
              : 'Créer mon compte'}
          </button>
        </form>
      </div>

      <p className="text-xs text-[#6B7280] mt-6 text-center max-w-xs">
        En continuant, tu acceptes les conditions d&apos;utilisation de BAARA Skills.
      </p>
    </div>
  )
}

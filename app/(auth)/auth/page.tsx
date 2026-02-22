'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Eye, EyeOff, Loader2 } from 'lucide-react'

type Mode = 'connexion' | 'inscription'

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
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error

        // Vérifier si le profil existe (onboarding fait ou pas)
        const { data: profile } = await supabase
          .from('profiles')
          .select('prenom')
          .eq('id', data.user.id)
          .single()

        if (!profile?.prenom) {
          router.push('/onboarding')
        } else {
          router.push('/catalogue')
        }
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Une erreur est survenue'
      if (message.includes('Invalid login credentials')) {
        setError('Email ou mot de passe incorrect.')
      } else if (message.includes('Email not confirmed')) {
        setError('Confirme ton email avant de te connecter.')
      } else if (message.includes('Password should be')) {
        setError('Le mot de passe doit contenir au moins 6 caractères.')
      } else {
        setError(message)
      }
    } finally {
      setLoading(false)
    }
  }

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
        {/* Tabs */}
        <div className="flex bg-[#F8F9FA] rounded-lg p-1 mb-6">
          <button
            onClick={() => { setMode('connexion'); setError(null) }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
              mode === 'connexion'
                ? 'bg-white text-[#1A2742] shadow-sm'
                : 'text-[#6B7280] hover:text-[#1A2742]'
            }`}
          >
            Connexion
          </button>
          <button
            onClick={() => { setMode('inscription'); setError(null) }}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors min-h-[44px] ${
              mode === 'inscription'
                ? 'bg-white text-[#1A2742] shadow-sm'
                : 'text-[#6B7280] hover:text-[#1A2742]'
            }`}
          >
            Inscription
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Adresse email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="ton@email.com"
              required
              className="w-full px-3 py-2.5 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
            />
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm font-medium text-[#1A1A1A] mb-1.5">
              Mot de passe
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={mode === 'inscription' ? 'Minimum 6 caractères' : '••••••••'}
                required
                className="w-full px-3 py-2.5 pr-10 border border-[#E5E7EB] rounded-lg text-[#1A1A1A] placeholder:text-[#6B7280] focus:outline-none focus:ring-2 focus:ring-[#1A2742] min-h-[44px] text-base"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7280]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <p className="text-sm text-[#EF4444] bg-red-50 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          {success && (
            <p className="text-sm text-[#10B981] bg-green-50 px-3 py-2 rounded-lg">
              {success}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1A2742] text-white py-3 rounded-lg font-semibold min-h-[44px] hover:bg-[#1A2742]/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2 mt-2"
          >
            {loading && <Loader2 size={18} className="animate-spin" />}
            {mode === 'connexion' ? 'Se connecter' : 'Créer mon compte'}
          </button>
        </form>
      </div>

      <p className="text-xs text-[#6B7280] mt-6 text-center max-w-xs">
        En continuant, tu acceptes les conditions d&apos;utilisation de BAARA Skills.
      </p>
    </div>
  )
}

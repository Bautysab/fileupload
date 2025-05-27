"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { getSupabaseClient } from "@/lib/supabase"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const router = useRouter()
  const supabase = getSupabaseClient()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage("")

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })
        if (error) throw error
        router.push("/dashboard")
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        if (error) throw error
        setMessage("¡Registro exitoso! Revisa tu email para confirmar tu cuenta.")
      }
    } catch (error: any) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900 relative overflow-hidden">
      {/* Fondo cuadriculado animado */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
          {/* Cuadrícula animada */}
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `
                linear-gradient(rgba(59, 130, 246, 0.1) 1px, transparent 1px),
                linear-gradient(90deg, rgba(59, 130, 246, 0.1) 1px, transparent 1px)
              `,
              backgroundSize: "50px 50px",
              animation: "gridMove 20s linear infinite",
            }}
          />
          {/* Puntos brillantes en intersecciones */}
          {Array.from({ length: 30 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${2 + Math.random() * 2}s`,
              }}
            />
          ))}
        </div>
      </div>

      <Card className="w-full max-w-md bg-gray-800 border-gray-700 relative z-10 transform transition-all duration-300 hover:scale-105 hover:shadow-2xl">
        <CardHeader>
          <CardTitle className="text-white text-center text-2xl font-bold">
            {isLogin ? "Iniciar Sesión" : "Registrarse"}
          </CardTitle>
          <CardDescription className="text-gray-400 text-center">
            {isLogin ? "Accede a tu almacén de archivos" : "Crea tu cuenta para comenzar"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-[1.02]"
              />
            </div>
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="bg-gray-700 border-gray-600 text-white placeholder-gray-400 transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:scale-[1.02]"
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 hover:shadow-lg active:scale-95"
              disabled={loading}
            >
              <span className="flex items-center justify-center gap-2">
                {loading && (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                )}
                {loading ? "Cargando..." : isLogin ? "Iniciar Sesión" : "Registrarse"}
              </span>
            </Button>
          </form>

          {message && (
            <div
              className={`mt-4 text-sm text-center p-3 rounded-lg transition-all duration-300 ${
                message.includes("exitoso")
                  ? "text-green-400 bg-green-900 bg-opacity-20 border border-green-500"
                  : "text-red-400 bg-red-900 bg-opacity-20 border border-red-500"
              }`}
            >
              {message}
            </div>
          )}

          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm text-blue-400 hover:text-blue-300 hover:underline transition-all duration-200 transform hover:scale-105"
            >
              {isLogin ? "¿No tienes cuenta? Regístrate" : "¿Ya tienes cuenta? Inicia sesión"}
            </button>
          </div>
        </CardContent>
      </Card>

      <style jsx>{`
        @keyframes gridMove {
          0% { transform: translate(0, 0); }
          100% { transform: translate(50px, 50px); }
        }
      `}</style>
    </div>
  )
}

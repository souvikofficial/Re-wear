"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Sparkles, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface FormErrors {
  email?: string
  password?: string
  general?: string
}

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "email":
        if (!value.trim()) return "Email is required"
        if (!authService.isValidEmail(value)) return "Please enter a valid email address"
        return undefined

      case "password":
        if (!value) return "Password is required"
        return undefined

      default:
        return undefined
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target

    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear previous error for this field
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }))
    }

    // Real-time validation
    const error = validateField(name, value)
    if (error) {
      setErrors((prev) => ({ ...prev, [name]: error }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    // Validate all fields
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value)
      if (error) {
        newErrors[key as keyof FormErrors] = error
      }
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous general error
    setErrors((prev) => ({ ...prev, general: undefined }))

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log("Starting signin process...")

      await authService.signIn(formData.email.trim(), formData.password)

      console.log("Signin successful, redirecting...")
      setSuccess(true)
      setTimeout(() => {
        router.push("/dashboard")
      }, 1000)
    } catch (error: any) {
      console.error("Signin error:", error)

      const errorMessage = error.message || "An unexpected error occurred. Please try again."

      if (errorMessage.includes("Invalid email or password")) {
        setErrors({ general: "Invalid email or password. Please check your credentials and try again." })
      } else if (errorMessage.includes("Email not confirmed")) {
        setErrors({ general: "Please check your email and click the confirmation link before signing in." })
      } else if (errorMessage.includes("Too many requests")) {
        setErrors({ general: "Too many login attempts. Please wait a few minutes before trying again." })
      } else if (errorMessage.includes("No account found")) {
        setErrors({ general: "No account found with this email address. Please sign up first." })
      } else {
        setErrors({ general: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass border-0 shadow-2xl animate-fade-in-up">
            <CardContent className="pt-8 text-center">
              <div className="text-green-500 mb-6 animate-pulse-glow">
                <CheckCircle2 className="h-20 w-20 mx-auto" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Welcome Back!
              </h2>
              <p className="text-gray-600 text-lg">Successfully signed in. Redirecting to your dashboard...</p>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center">
        {/* Left Side - Branding */}
        <div className="hidden lg:block text-white animate-fade-in-up">
          <div className="space-y-8">
            <div className="flex items-center space-x-3">
              <Sparkles className="h-12 w-12 text-yellow-300" />
              <h1 className="text-5xl font-bold">ReWear</h1>
            </div>
            <div className="space-y-6">
              <h2 className="text-4xl font-light leading-tight">
                Welcome Back to{" "}
                <span className="font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Sustainable Fashion
                </span>
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Continue your journey towards a more sustainable wardrobe. Your closet and the planet will thank you.
              </p>
              <div className="space-y-4 pt-8">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-yellow-300 rounded-full"></div>
                  <span className="text-white/80">Discover unique pieces from our community</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-pink-300 rounded-full"></div>
                  <span className="text-white/80">Earn points for every successful exchange</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-300 rounded-full"></div>
                  <span className="text-white/80">Connect with like-minded fashion enthusiasts</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto animate-slide-in-right">
          <Card className="glass border-0 shadow-2xl backdrop-blur-xl">
            <CardHeader className="text-center pb-8">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ReWear
                </span>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">Welcome Back</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Sign in to continue your sustainable journey
              </CardDescription>
            </CardHeader>

            <CardContent className="space-y-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                {errors.general && (
                  <Alert variant="destructive" className="border-red-200 bg-red-50">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="text-red-800">{errors.general}</AlertDescription>
                  </Alert>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your email"
                      className={`pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl ${
                        errors.email ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.email}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700">
                    Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your password"
                      className={`pl-10 pr-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl ${
                        errors.password ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 gradient-primary text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                  disabled={loading || Object.keys(errors).some((key) => errors[key as keyof FormErrors])}
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Signing In...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Sign In</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Don't have an account?{" "}
                  <Link
                    href="/auth/signup"
                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Create one
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

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
import { Progress } from "@/components/ui/progress"
import { Sparkles, User, Mail, Lock, ArrowRight, CheckCircle2, AlertCircle, Eye, EyeOff } from "lucide-react"
import Link from "next/link"

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function SignUpPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  })
  const [errors, setErrors] = useState<FormErrors>({})
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const router = useRouter()

  // Real-time validation
  const validateField = (name: string, value: string): string | undefined => {
    switch (name) {
      case "name":
        if (!value.trim()) return "Full name is required"
        if (value.trim().length < 2) return "Name must be at least 2 characters"
        if (value.trim().length > 50) return "Name must be less than 50 characters"
        return undefined

      case "email":
        if (!value.trim()) return "Email is required"
        if (!authService.isValidEmail(value)) return "Please enter a valid email address"
        return undefined

      case "password":
        const passwordValidation = authService.validatePassword(value)
        if (!passwordValidation.isValid) return passwordValidation.message
        return undefined

      case "confirmPassword":
        if (!value) return "Please confirm your password"
        if (value !== formData.password) return "Passwords do not match"
        return undefined

      default:
        return undefined
    }
  }

  // Calculate password strength
  const calculatePasswordStrength = (password: string): number => {
    let strength = 0
    if (password.length >= 6) strength += 25
    if (password.length >= 8) strength += 25
    if (/[A-Z]/.test(password)) strength += 25
    if (/[0-9]/.test(password)) strength += 25
    return strength
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

    // Update password strength
    if (name === "password") {
      setPasswordStrength(calculatePasswordStrength(value))
    }

    // Validate confirm password when password changes
    if (name === "password" && formData.confirmPassword) {
      const confirmError = validateField("confirmPassword", formData.confirmPassword)
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }))
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
      console.log("Starting signup process...")

      const result = await authService.signUp(formData.email.trim(), formData.password, formData.name.trim())

      console.log("Signup result:", result)

      if (result.needsConfirmation) {
        console.log("Email confirmation required")
        setNeedsConfirmation(true)
      } else {
        console.log("Signup successful, redirecting...")
        setSuccess(true)
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      }
    } catch (error: any) {
      console.error("Signup error:", error)

      // Handle specific error types
      const errorMessage = error.message || "An unexpected error occurred. Please try again."

      if (errorMessage.includes("email already exists") || errorMessage.includes("User already registered")) {
        setErrors({ email: "An account with this email already exists. Please sign in instead." })
      } else if (errorMessage.includes("Invalid email")) {
        setErrors({ email: "Please enter a valid email address." })
      } else if (errorMessage.includes("Password")) {
        setErrors({ password: errorMessage })
      } else {
        setErrors({ general: errorMessage })
      }
    } finally {
      setLoading(false)
    }
  }

  if (needsConfirmation) {
    return (
      <div className="min-h-screen gradient-primary flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="glass border-0 shadow-2xl animate-fade-in-up">
            <CardContent className="pt-8 text-center">
              <div className="text-blue-500 mb-6 animate-pulse-glow">
                <Mail className="h-20 w-20 mx-auto" />
              </div>
              <h2 className="text-3xl font-bold mb-4 bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Check Your Email
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                We've sent you a confirmation link at <strong>{formData.email}</strong>. Please check your email and
                click the link to activate your account.
              </p>
              <div className="space-y-3">
                <Link href="/auth/login">
                  <Button variant="outline" className="w-full bg-transparent">
                    Back to Login
                  </Button>
                </Link>
                <Button variant="ghost" onClick={() => setNeedsConfirmation(false)} className="w-full text-sm">
                  Try a different email
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
                Welcome to ReWear!
              </h2>
              <p className="text-gray-600 text-lg mb-6">
                Your account has been created successfully. Redirecting to your dashboard...
              </p>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full animate-pulse w-full"></div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const getPasswordStrengthColor = () => {
    if (passwordStrength < 50) return "bg-red-500"
    if (passwordStrength < 75) return "bg-yellow-500"
    return "bg-green-500"
  }

  const getPasswordStrengthText = () => {
    if (passwordStrength < 25) return "Very Weak"
    if (passwordStrength < 50) return "Weak"
    if (passwordStrength < 75) return "Good"
    return "Strong"
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
                Transform Your Wardrobe,{" "}
                <span className="font-bold bg-gradient-to-r from-yellow-300 to-pink-300 bg-clip-text text-transparent">
                  Transform the World
                </span>
              </h2>
              <p className="text-xl text-white/80 leading-relaxed">
                Join thousands of fashion-conscious individuals who are making sustainable choices. Exchange clothes,
                earn points, and be part of the circular fashion revolution.
              </p>
              <div className="grid grid-cols-2 gap-6 pt-8">
                <div className="text-center">
                  <div className="text-3xl font-bold text-yellow-300">10K+</div>
                  <div className="text-white/70">Happy Users</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-pink-300">50K+</div>
                  <div className="text-white/70">Items Exchanged</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Signup Form */}
        <div className="w-full max-w-md mx-auto animate-slide-in-right">
          <Card className="glass border-0 shadow-2xl backdrop-blur-xl">
            <CardHeader className="text-center pb-8">
              <div className="lg:hidden flex items-center justify-center space-x-2 mb-6">
                <Sparkles className="h-8 w-8 text-purple-600" />
                <span className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  ReWear
                </span>
              </div>
              <CardTitle className="text-3xl font-bold text-gray-900">Create Account</CardTitle>
              <CardDescription className="text-lg text-gray-600">
                Start your sustainable fashion journey today
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
                  <Label htmlFor="name" className="text-sm font-semibold text-gray-700">
                    Full Name
                  </Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      name="name"
                      type="text"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter your full name"
                      className={`pl-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl ${
                        errors.name ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.name}
                    </p>
                  )}
                </div>

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
                      placeholder="Create a secure password"
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
                  {formData.password && (
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Password strength:</span>
                        <span
                          className={`font-medium ${passwordStrength < 50 ? "text-red-600" : passwordStrength < 75 ? "text-yellow-600" : "text-green-600"}`}
                        >
                          {getPasswordStrengthText()}
                        </span>
                      </div>
                      <Progress value={passwordStrength} className="h-2" />
                    </div>
                  )}
                  {errors.password && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700">
                    Confirm Password
                  </Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      placeholder="Confirm your password"
                      className={`pl-10 pr-10 h-12 border-gray-200 focus:border-purple-500 focus:ring-purple-500 rounded-xl ${
                        errors.confirmPassword ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-sm text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      {errors.confirmPassword}
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
                      <span>Creating Account...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <span>Create Account</span>
                      <ArrowRight className="h-5 w-5" />
                    </div>
                  )}
                </Button>
              </form>

              <div className="text-center pt-4">
                <p className="text-gray-600">
                  Already have an account?{" "}
                  <Link
                    href="/auth/login"
                    className="font-semibold text-purple-600 hover:text-purple-700 transition-colors"
                  >
                    Sign in
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

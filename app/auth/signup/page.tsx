"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { authService } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Sparkles, Mail, CheckCircle2, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { toast } from "@/components/ui/use-toast"

interface FormErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
  general?: string
}

export default function SignUpPage() {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordStrength, setPasswordStrength] = useState(0)
  const [needsConfirmation, setNeedsConfirmation] = useState(false)
  const [success, setSuccess] = useState(false)
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
        if (value !== password) return "Passwords do not match"
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

    switch (name) {
      case "name":
        setName(value)
        break
      case "email":
        setEmail(value)
        break
      case "password":
        setPassword(value)
        setPasswordStrength(calculatePasswordStrength(value))
        const confirmError = validateField("confirmPassword", confirmPassword)
        setConfirmPassword(confirmError ? "" : confirmPassword)
        break
      case "confirmPassword":
        setConfirmPassword(value)
        break
      default:
        break
    }

    // Clear previous error for this field
    const error = validateField(name, value)
    if (error) {
      toast({
        title: "Validation Error",
        description: error,
        variant: "destructive",
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const { data, error } = await authService.signUp(email, password, name)

      if (error) {
        throw error
      }

      if (data?.user) {
        toast({
          title: "Signup Successful!",
          description: "Your account has been created. Welcome to ReWear!",
          variant: "success",
        })
        router.push("/dashboard")
      } else {
        // This case should ideally not be hit if authService.signUp throws on error
        toast({
          title: "Signup Failed",
          description: "An unexpected issue occurred during signup. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error: any) {
      console.error("Signup error:", error)
      let errorMessage = "An unexpected error occurred. Please try again."
      if (error.message.includes("User already registered")) {
        errorMessage = "This email is already registered. Please log in or use a different email."
      } else if (error.message.includes("Password should be at least 6 characters")) {
        errorMessage = "Password must be at least 6 characters long."
      } else {
        errorMessage = error.message
      }

      toast({
        title: "Signup Failed",
        description: errorMessage,
        variant: "destructive",
      })
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
                We've sent you a confirmation link at <strong>{email}</strong>. Please check your email and click the
                link to activate your account.
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md grid lg:grid-cols-2 gap-8 items-center">
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
                <div className="grid gap-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="John Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-1"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                  {password && (
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
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="absolute right-0 top-0 h-full px-3 py-1"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      <span className="sr-only">{showConfirmPassword ? "Hide password" : "Show password"}</span>
                    </Button>
                  </div>
                </div>
                <Button type="submit" className="w-full bg-green-600 hover:bg-green-700" disabled={loading}>
                  {loading ? "Signing Up..." : "Sign Up"}
                </Button>
              </form>
              <div className="mt-6 text-center text-sm text-gray-600">
                Already have an account?{" "}
                <Link href="/auth/login" className="font-medium text-green-600 hover:text-green-700">
                  Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

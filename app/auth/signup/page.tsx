import Link from "next/link"
import { redirect } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"
import { getServerSupabase } from "@/lib/supabase/server"

async function signup(formData: FormData) {
  "use server"

  const full_name = formData.get("full_name") as string
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (password !== confirmPassword) {
    redirect(`/auth/signup?error=password_mismatch`)
  }

  const supabase = getServerSupabase()

  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name,
      },
    },
  })

  if (error) {
    // Map common Supabase errors to error codes
    let errorCode = "signup_failed"
    if (error.message.includes("already registered") || error.message.includes("already exists")) {
      errorCode = "email_already_exists"
    } else if (error.message.includes("invalid email")) {
      errorCode = "invalid_email"
    } else if (error.message.includes("password")) {
      errorCode = "password_too_short"
    }
    redirect(`/auth/signup?error=${errorCode}`)
  }

  redirect("/")
}

export default async function SignupPage({ searchParams }) {
  const params = await searchParams

  const error = params?.error
  const message = params?.message

  return (
    <Card className="w-full">
      <CardHeader className="text-right space-y-1">
        <CardTitle>ایجاد حساب کاربری</CardTitle>
        <CardDescription>
          برای شروع، لطفاً اطلاعات خود را وارد کنید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={signup} className="space-y-4">
          {error && (
            <div className="mt-2 text-sm text-red-600 text-right">
              {error}
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="fullname">نام و نام خانوادگی</Label>
            <Input
              id="fullname"
              name="full_name"
              type="text"
              placeholder="نام و نام خانوادگی"
              required
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">ایمیل</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              required
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">رمز عبور</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              className="text-right"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">تأیید رمز عبور</Label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              className="text-right"
            />
          </div>
          <Button type="submit" className="w-full">
            ثبت‌نام
          </Button>
        </form>
        <div className="mt-6 text-center text-sm">
          <Link
            href="/auth/login"
            className="text-foreground/70 hover:text-foreground underline underline-offset-4"
          >
            قبلاً ثبت‌نام کرده‌اید؟ ورود
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


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

async function login(formData: FormData) {
  "use server"

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = await getServerSupabase()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    redirect("/auth/login?error=invalid_credentials")
  }

  redirect("/")
}

async function sendMagicLink(formData: FormData) {
  "use server"

  const email = String(formData.get("magic_email") || "").trim()

  if (!email) return redirect("/auth/login?error=missing_email")

  // Call signInWithOtp directly in the server action so cookies are set
  // in the browser's context, not in an internal API route fetch
  const supabase = await getServerSupabase()

  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: {
      emailRedirectTo: process.env.NEXT_PUBLIC_BASE_URL + "/auth/callback",
    },
  })

  if (error) {
    return redirect(`/auth/login?error=${encodeURIComponent(error.message)}`)
  }

  return redirect("/auth/login?message=magic_link_sent")
}

export default async function LoginPage({ searchParams }) {
  const params = await searchParams

  const error = params?.error
  const message = params?.message

  return (
    <Card className="w-full">
      <CardHeader className="text-right space-y-1">
        <CardTitle>ورود به حساب کاربری</CardTitle>
        <CardDescription>
          برای ادامه، لطفاً وارد حساب کاربری خود شوید
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={login} className="space-y-4">
          {error && (
            <div className="mt-2 text-sm text-red-600 text-right">
              {error}
            </div>
          )}
          {message && (
            <div className="mt-2 text-sm text-green-600 text-right">
              {message}
            </div>
          )}
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
          <div className="flex items-center space-x-2 space-x-reverse">
            <input
              id="remember"
              type="checkbox"
              className="h-4 w-4 rounded border-foreground/20"
            />
            <Label htmlFor="remember" className="text-sm font-normal cursor-pointer">
              مرا به خاطر بسپار
            </Label>
          </div>
          <Button type="submit" className="w-full">
            ورود
          </Button>
        </form>
        <form action={sendMagicLink} className="mt-6 space-y-3">
          <div className="space-y-2 text-right">
            <Label htmlFor="magic_email">ورود با لینک جادویی</Label>
            <Input
              id="magic_email"
              name="magic_email"
              type="email"
              placeholder="ایمیل خود را وارد کنید"
              className="text-right"
              required
            />
          </div>
          <Button type="submit" variant="outline" className="w-full">
            ارسال لینک جادویی به ایمیل
          </Button>
        </form>
        <div className="mt-6 space-y-3 text-center text-sm">
          <div>
            <Link
              href="/auth/signup"
              className="text-foreground/70 hover:text-foreground underline underline-offset-4"
            >
              هنوز ثبت‌نام نکرده‌اید؟ ثبت‌نام
            </Link>
          </div>
          <div>
            <Link
              href="/auth/otp"
              className="text-foreground/70 hover:text-foreground underline underline-offset-4"
            >
              ورود با شماره موبایل
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


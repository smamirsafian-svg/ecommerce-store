"use client"

import Link from "next/link"
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

export default function OTPPage() {
  const handlePhoneSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  const handleOTPSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
  }

  return (
    <Card className="w-full">
      <CardHeader className="text-right space-y-1">
        <CardTitle>ورود با شماره موبایل</CardTitle>
        <CardDescription>
          کد تأیید به شماره موبایل شما ارسال خواهد شد
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <form onSubmit={handlePhoneSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="phone">شماره موبایل</Label>
            <Input
              id="phone"
              type="tel"
              placeholder="09123456789"
              required
              className="text-right"
            />
          </div>
          <Button type="submit" className="w-full">
            ارسال کد تأیید
          </Button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-foreground/20" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-foreground/60">
              یا
            </span>
          </div>
        </div>

        <form onSubmit={handleOTPSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="otp">کد تأیید</Label>
            <Input
              id="otp"
              type="text"
              placeholder="۶ رقم"
              maxLength={6}
              required
              className="text-right"
            />
          </div>
          <Button type="submit" className="w-full">
            تأیید و ورود
          </Button>
        </form>

        <div className="mt-6 text-center text-sm">
          <Link
            href="/auth/login"
            className="text-foreground/70 hover:text-foreground underline underline-offset-4"
          >
            بازگشت به صفحه ورود
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}


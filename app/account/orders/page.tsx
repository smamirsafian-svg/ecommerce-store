import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card"

export default function OrdersPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">سفارش‌ها</h1>
        <p className="text-muted-foreground mt-2">
          تاریخچه سفارش‌های خود را مشاهده کنید
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تاریخچه سفارش‌ها</CardTitle>
          <CardDescription>
            لیست تمام سفارش‌های شما
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="text-center text-muted-foreground py-8">
              هنوز سفارشی ثبت نشده است
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}


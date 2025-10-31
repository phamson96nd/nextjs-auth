"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { LoginBody, LoginBodyType } from "@/schemaValidations/auth.schema"
import { toast } from "sonner"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { httpClientRequest } from "@/lib/httpClientRequest"

export default function LoginForm() {
  const router = useRouter()

  const form = useForm<LoginBodyType>({
    resolver: zodResolver(LoginBody),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: LoginBodyType) {
    try {
      await httpClientRequest("POST", "/api/auth/login", {
        body: values,
      })

      router.push("/")
      router.refresh()
      toast.success("Đăng nhập thành công!")

    } catch (errors) {
      console.log(errors)
      toast.error("Đăng nhập thất bại", {
        richColors: true,
      })
    }
  }

  return (
    <div className="flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-10">
      <Card className="w-full max-w-md shadow-xl border border-slate-200 rounded-2xl bg-white">
        <CardHeader className="text-center space-y-2 pb-2">
          <CardTitle className="text-2xl font-bold text-slate-800">Đăng nhập</CardTitle>
          <CardDescription className="text-slate-500">
            Nhập thông tin tài khoản của bạn để tiếp tục
          </CardDescription>
        </CardHeader>

        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="you@example.com"
                        className="h-11 rounded-xl border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-sm font-medium text-slate-700">Mật khẩu</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="password"
                        placeholder="••••••••"
                        className="h-11 rounded-xl border-slate-300 focus-visible:ring-2 focus-visible:ring-slate-500"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-xs mt-1" />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full h-11 text-[15px] font-semibold rounded-xl transition-all duration-200 bg-slate-800 hover:bg-slate-700"
              >
                Đăng nhập
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

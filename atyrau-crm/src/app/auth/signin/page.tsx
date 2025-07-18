"use client";

import { Button } from "@/components/atoms/Button";
import { Card } from "@/components/atoms/Card";
import { FormField } from "@/components/molecules/FormField";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { Suspense, useState } from "react";

interface FormValues {
  email: string;
  password: string;
}

interface FormErrors {
  email?: string;
  password?: string;
  general?: string;
}

function SigninPageForm() {
  const searchParams = useSearchParams();
  const callbackUrl = searchParams?.get("callbackUrl") || "/dashboard";
  const [isLoading, setIsLoading] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({
    email: "",
    password: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formValues.email) {
      newErrors.email = "Email обязателен";
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      newErrors.email = "Некорректный email";
    }

    if (!formValues.password) {
      newErrors.password = "Пароль обязателен";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormValues((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email: formValues.email,
        password: formValues.password,
        callbackUrl: callbackUrl,
      });

      if (result?.error) {
        throw new Error("Неверный email или пароль");
      }

      // Force a hard redirect after successful authentication
      if (result?.ok) {
        window.location.href = callbackUrl;
      }
    } catch (error: unknown) {
      setErrors((prev) => ({
        ...prev,
        general:
          error instanceof Error
            ? error instanceof Error
              ? error.message
              : "Unknown error"
            : "Ошибка при входе",
      }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-app-bg px-4 py-12">
      <Card className="w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mb-4">
            <span className="text-4xl">💎</span>
          </div>
          <h1 className="text-2xl font-bold text-text">DMD</h1>
          <h2 className="text-lg font-semibold text-text mt-2">
            Вход в аккаунт
          </h2>
          <p className="text-text-muted mt-2">Введите ваш email и пароль</p>
        </div>

        {errors.general && (
          <div className="mb-4 p-3 bg-error/10 border border-error/30 text-error rounded-md">
            {errors.general}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <FormField
            id="email"
            type="email"
            label="Email"
            value={formValues.email}
            onChange={handleChange}
            error={errors.email}
            required
            autoComplete="email"
          />

          <FormField
            id="password"
            type="password"
            label="Пароль"
            value={formValues.password}
            onChange={handleChange}
            error={errors.password}
            required
            autoComplete="current-password"
          />

          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <input
                id="remember_me"
                type="checkbox"
                className="h-4 w-4 rounded border-input-border text-primary focus:ring-primary/20 focus:ring-2"
              />
              <label
                htmlFor="remember_me"
                className="ml-2 block text-sm text-text-body"
              >
                Запомнить меня
              </label>
            </div>

            <Link
              href="/auth/forgot-password"
              className="text-sm text-primary hover:text-primary-hover transition-colors"
            >
              Забыли пароль?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            isLoading={isLoading}
          >
            Войти
          </Button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-text-muted">
            Нет аккаунта?{" "}
            <Link
              href="/auth/signup"
              className="text-primary hover:text-primary-hover transition-colors font-medium"
            >
              Зарегистрироваться
            </Link>
          </p>
        </div>
      </Card>
    </div>
  );
}

export default function SigninPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center min-h-screen bg-app-bg">
          <div className="text-text-muted">Загрузка...</div>
        </div>
      }
    >
      <SigninPageForm />
    </Suspense>
  );
}

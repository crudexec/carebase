"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { isEmpty } from "lodash";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight } from "react-icons/fa6";
import { useSWRConfig } from "swr";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
  Form,
  FormField,
  FormRender,
  Input,
} from "@/components/ui";
import { useAuth } from "@/context/AuthContext";
import { getCookies } from "@/lib";
import {
  loginDefaultValues,
  LoginForm,
  loginFormSchema,
} from "@/schema/auth/login";

import ErrorBox from "../error-box";

const LoginUserForm = () => {
  const [loading, setLoading] = useState(false);
  const { mutate } = useSWRConfig();
  const [error, setError] = useState<string>("");
  const { updateUser, clearStorage } = useAuth();
  const form = useForm<LoginForm>({
    defaultValues: loginDefaultValues,
    resolver: zodResolver(loginFormSchema),
  });
  const router = useRouter();

  const handleSubmit = async (formData: LoginForm) => {
    try {
      setLoading(true);
      const response = await axios.post("/api/auth/login", formData);
      const data = await response.data;
      if (data?.data?.providers) {
        updateUser(data?.data);
        router.replace("/select-provider");
      } else if (!isEmpty(data?.data)) {
        updateUser(data?.data);
        window.location.href = "/";
      }
      setLoading(false);
    } catch (err) {
      setError(err?.response?.data?.message || err?.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getCookies().then(async (cookies) => {
      if (!cookies?.auth && !cookies.refresh) {
        clearStorage();
        mutate(() => true, undefined, false);
        router.push("/login", undefined);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mutate]);

  return (
    <Card className="w-[500px]">
      <CardHeader>
        <CardTitle className="text-3xl text-center">Welcome Back!</CardTitle>
        <CardDescription className="text-center">
          Please enter your credentials to log in.
        </CardDescription>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name={"email"}
              render={({ field }) => (
                <FormRender label={"Email"} required={true}>
                  <Input {...field} />
                </FormRender>
              )}
            />

            <FormField
              control={form.control}
              name={"password"}
              render={({ field }) => (
                <FormRender label={"Password"} required={true}>
                  <Input {...field} type="password" />
                </FormRender>
              )}
            />
            {error && <ErrorBox message={error} />}
          </CardContent>
          <CardFooter>
            <Button
              className="w-full"
              type="submit"
              rightIcon={<FaArrowRight />}
              loading={loading}
            >
              Login
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default LoginUserForm;

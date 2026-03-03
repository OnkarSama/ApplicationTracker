"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader } from "@heroui/react";
import { Input } from "@heroui/react";
import { Button } from "@heroui/react";
import { Checkbox } from "@heroui/react";
import { setAuthed, isAuthed } from "@/lib/storage";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [remember, setRemember] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (isAuthed()) router.replace("/dashboard");
  }, [router]);

  return (
    <main className="min-h-[100svh] grid place-items-center p-6 bg-default-50">
      <div className="w-full max-w-md">
        <Card className="shadow-medium">
          <CardHeader className="flex flex-col items-start gap-1">
            <h1 className="text-2xl font-semibold">Welcome back</h1>
            <p className="text-sm text-default-500">
              Log in to view your applications dashboard
            </p>
          </CardHeader>

          <CardBody className="gap-4">
            <Input
              label="Email"
              placeholder="you@example.com"
              value={email}
              onValueChange={setEmail}
            />
            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              value={pw}
              onValueChange={setPw}
            />

            <div className="flex items-center justify-between">
              <Checkbox isSelected={remember} onValueChange={setRemember} classNames={{icon: "hidden",}}>
                Remember me
              </Checkbox>
              <button className="text-sm text-primary">Forgot password?</button>
            </div>

            {err && <p className="text-sm text-danger">{err}</p>}

            <Button
              color="primary"
              className="w-full"
              onPress={() => {
                setErr(null);
                if (!email.trim() || !pw.trim()) {
                  setErr("Please enter email and password.");
                  return;
                }
                // placeholder auth (swap for backend later)
                setAuthed(true);
                router.push("/dashboard");
              }}
            >
              Log in
            </Button>

            <p className="text-sm text-default-500">
              New here? <span className="text-primary">Create an account</span>
            </p>
          </CardBody>
        </Card>
      </div>
    </main>
  );
}

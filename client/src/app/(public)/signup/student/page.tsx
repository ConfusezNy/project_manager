"use client";

/**
 * หน้าสมัครสมาชิก — นักศึกษา
 * เข้าถึงได้หลัง verify OTP จาก /signup → redirect มาที่นี่
 * email ถูก pre-fill จาก query params
 */

import React, { Suspense } from "react";
import { StudentSignupForm } from "@/modules/auth/components/StudentSignupForm";

export default function StudentSignupPage() {
    return (
        <Suspense fallback={null}>
            <StudentSignupForm />
        </Suspense>
    );
}

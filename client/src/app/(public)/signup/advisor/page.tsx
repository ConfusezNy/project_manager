"use client";

/**
 * หน้าสมัครสมาชิก — อาจารย์
 * เข้าถึงได้หลัง verify OTP จาก /signup → redirect มาที่นี่
 * email ถูก pre-fill จาก query params
 */

import React, { Suspense } from "react";
import { AdvisorSignupForm } from "@/modules/auth/components/AdvisorSignupForm";

export default function AdvisorSignupPage() {
    return (
        <Suspense fallback={null}>
            <AdvisorSignupForm />
        </Suspense>
    );
}

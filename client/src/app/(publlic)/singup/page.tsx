
"use client";

import React, { useState } from "react";

type FormState = {
	titles: string;
	firstname: string;
	lastname: string;
	tel_number: string;
	email: string;
	password: string;
};

export default function SignupPage() {
	const [form, setForm] = useState<FormState>({
		titles: "",
		firstname: "",
		lastname: "",
		tel_number: "",
		email: "",
		password: "",
	});
	const [loading, setLoading] = useState(false);
	const [message, setMessage] = useState<string | null>(null);

	function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
		const { name, value } = e.target as HTMLInputElement;
		setForm((s) => ({ ...s, [name]: value }));
	}

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault();
		setLoading(true);
		setMessage(null);
		try {
			const res = await fetch(`/api/auth/signup`, {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(form),
			});
			const data = await res.json();
			if (res.ok) {
				setMessage("สมัครสมาชิกสำเร็จ");
				setForm({ titles: "", firstname: "", lastname: "", tel_number: "", email: "", password: "" });
			} else {
				setMessage(data?.error || data?.message || "เกิดข้อผิดพลาด");
			}
		} catch (err) {
			setMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
		} finally {
			setLoading(false);
		}
	}

	return (
		<div className="max-w-md mx-auto p-6">
			<h1 className="text-2xl font-semibold mb-4">สมัครสมาชิก</h1>
			{message && (
				<div className="mb-4 text-sm text-center">{message}</div>
			)}
			<form onSubmit={handleSubmit} className="space-y-3">
				<div>
					<label className="block text-sm">คำนำหน้า</label>
					<select name="titles" value={form.titles} onChange={handleChange} className="w-full border rounded p-2">
						<option value="">เลือกคำนำหน้า</option>
						<option value="นาย">นาย</option>
						<option value="นาง">นาง</option>
						<option value="นางสาว">นางสาว</option>
					</select>
				</div>

				<div>
					<label className="block text-sm">ชื่อ</label>
					<input name="firstname" value={form.firstname} onChange={handleChange} className="w-full border rounded p-2" />
				</div>

				<div>
					<label className="block text-sm">นามสกุล</label>
					<input name="lastname" value={form.lastname} onChange={handleChange} className="w-full border rounded p-2" />
				</div>

				<div>
					<label className="block text-sm">เบอร์โทร</label>
					<input name="tel_number" value={form.tel_number} onChange={handleChange} className="w-full border rounded p-2" />
				</div>

				<div>
					<label className="block text-sm">อีเมล</label>
					<input name="email" value={form.email} onChange={handleChange} type="email" className="w-full border rounded p-2" />
				</div>

				<div>
					<label className="block text-sm">รหัสผ่าน</label>
					<input name="password" value={form.password} onChange={handleChange} type="password" className="w-full border rounded p-2" />
				</div>

				<div>
					<button type="submit" disabled={loading} className="w-full bg-blue-600 text-white p-2 rounded">
						{loading ? "กำลังส่ง..." : "สมัคร"}
					</button>
				</div>
			</form>
		</div>
	);
}


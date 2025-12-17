import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
    try{
        const body = await request.json()
        const{academicYear,semester,startDate,endDate} = body
        
        if(!academicYear,!semester,!startDate,!endDate){
            return NextResponse.json({error : "กรอกให้ครบ"},{status: 400})
        }
        const newTerm = await prisma.term.create({
            data : {
                academicYear:Number(academicYear), 
                semester : Number(semester),
                startDate : new Date(startDate),
                endDate : new Date(endDate)
            }


        })
        return NextResponse.json({
            message: "สร้างเทมอสำเร็จ",data : newTerm},{status: 201})

     } catch (error) {
    console.error("Error creating term:", error);
    return NextResponse.json({ error: "เกิดข้อผิดพลาดในการสร้างเทอม" }, { status: 500 });
  
    }
}

export async function GET() {
  try {
    const terms = await prisma.term.findMany({
      orderBy: [
        { academicYear: 'desc' }, // เรียงปีล่าสุดขึ้นก่อน
        { semester: 'desc' }      // เรียงเทอมล่าสุด
      ]
    });
    return NextResponse.json(terms);
  } catch (error) {
    return NextResponse.json({ error: "ดึงข้อมูลล้มเหลว" }, { status: 500 });
  }
}
export async function Delete(request : Request) {
try{
        const body = await request.json()  
        const {section} = body
 }
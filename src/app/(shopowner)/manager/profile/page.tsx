'use client'
import ProfileManagement from "@/sections/ProfileManagement/page"
import { useEffect } from "react"
import { useRouter } from "next/navigation"

function getStoredRoleNormalized(): string | null {
  if (typeof window === "undefined") {
    return null
  }
  const role = window.localStorage.getItem("role")
  return role ? role.toUpperCase() : null
}

function ProfileManage() {
  const router = useRouter()

  useEffect(() => {
    const role = getStoredRoleNormalized()
    if (role && role !== "SHOPOWNER") {
      router.replace("/manager")
    }
  }, [router])
  return (
    <ProfileManagement />
  )
}

export default ProfileManage
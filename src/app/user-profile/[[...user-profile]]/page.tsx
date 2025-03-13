import { UserProfile } from "@clerk/nextjs";
 
export default function Page() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <UserProfile path="/user-profile" routing="path" />
    </div>
  );
}

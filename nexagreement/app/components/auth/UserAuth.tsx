import { UserButton, useUser } from "@civic/auth-web3/react";

export function UserAuth() {
  const { user, isLoading } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-4">
        <UserButton />
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm">
        <span className="text-gray-500">Signed in as</span>
        <span className="ml-1 font-medium text-gray-900">{user.name || user.email}</span>
      </div>
      <UserButton />
    </div>
  );
} 
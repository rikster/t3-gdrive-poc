"use client";

import { FormEvent, ChangeEvent } from "react";
import { SearchInput } from "./SearchInput";
import { UploadButton } from "./UploadButton";
import { ServiceSelector } from "./ServiceSelector";
import { LogoutButton } from "./LogoutButton";
import { ThemeToggle } from "./theme/ThemeToggle";
import { AddServiceButton } from "./AddServiceButton";

interface ServiceAccount {
  id: string;
  service: string;
  name?: string;
  email?: string;
}

interface HeaderProps {
  isAuthenticated: boolean;
  activeServices: string[];
  serviceAccounts: ServiceAccount[];
  searchInputValue: string;
  onSearchInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onUpload: () => void;
  onDisconnectService: (serviceId: string) => void;
  onDisconnectAccount: (serviceId: string, accountId: string) => void;
  onServiceSelect: (service: string) => void;
  onAddAccount: (service: string) => void;
}

export function Header({
  isAuthenticated,
  activeServices,
  serviceAccounts,
  searchInputValue,
  onSearchInputChange,
  onSearchSubmit,
  onUpload,
  onDisconnectService,
  onDisconnectAccount,
  onServiceSelect,
  onAddAccount
}: HeaderProps) {
  return (
    <div className="flex flex-col gap-4 justify-between items-start mx-auto mb-6 max-w-6xl sm:flex-row sm:items-center sm:gap-0">
      <div className="flex justify-between items-center w-full sm:w-auto">
        <h1 className="text-2xl font-bold">StrataFusion</h1>
        <div className="sm:hidden">
          <ThemeToggle />
        </div>
      </div>
      <div className="flex gap-4 items-center w-full sm:w-auto">
        <div className="hidden sm:block">
          <ThemeToggle />
        </div>

        {/* Search input component */}
        <SearchInput
          searchInputValue={searchInputValue}
          onSearchInputChange={onSearchInputChange}
          onSearchSubmit={onSearchSubmit}
        />

        {/* Always show Add Service button */}
        <AddServiceButton
          onServiceSelect={onServiceSelect}
          onAddAccount={onAddAccount}
          activeServices={activeServices}
        />

        {isAuthenticated && (
          <UploadButton onClick={onUpload} className="w-full sm:w-auto" />
        )}

        {/* Service selector for multiple services */}
        <ServiceSelector 
          activeServices={activeServices} 
          serviceAccounts={serviceAccounts}
          onDisconnectService={onDisconnectService} 
          onDisconnectAccount={onDisconnectAccount}
        />

        {/* Always show logout button when authenticated with Clerk */}
        <LogoutButton />
      </div>
    </div>
  );
}

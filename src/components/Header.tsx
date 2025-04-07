"use client";

import { type FormEvent, type ChangeEvent } from "react";
import Image from "next/image";
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
  onAddAccount,
}: HeaderProps) {
  return (
    <div className="mx-auto mb-6 flex max-w-6xl flex-col items-start justify-between gap-4 sm:flex-row sm:items-center sm:gap-0">
      <div className="flex w-full items-center justify-between sm:w-auto">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">
            <Image
              src="/stratafusion_icon_256x256.ico"
              alt="StrataFusion Logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-md"
            />
          </div>
          <div>
            <h1 className="text-2xl font-bold">StrataFusion</h1>
            <p className="text-muted-foreground text-sm">
              Unified Cloud Storage
            </p>
          </div>
        </div>
        <div className="sm:hidden">
          <ThemeToggle />
        </div>
      </div>
      <div className="flex w-full items-center gap-4 sm:w-auto">
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

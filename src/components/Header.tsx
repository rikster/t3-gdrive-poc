"use client";

import Image from "next/image";
import type { FormEvent, ChangeEvent } from "react";

import type { ServiceAccount, ServiceType } from "~/types/services";

import { AddServiceButton } from "./AddServiceButton";
import { LogoutButton } from "./LogoutButton";
import { SearchInput } from "./SearchInput";
import { ServiceSelector } from "./ServiceSelector";
import { ThemeToggle } from "./theme/ThemeToggle";
import { UploadButton } from "./UploadButton";

interface HeaderProps {
  isAuthenticated: boolean;
  activeServices: ServiceType[];
  serviceAccounts: Record<ServiceType, ServiceAccount[]>;
  searchInputValue: string;
  onSearchInputChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onSearchSubmit: (e: FormEvent) => void;
  onUpload: () => void;
  onDisconnectService: (serviceId: ServiceType) => void;
  onDisconnectAccount: (serviceId: ServiceType, accountId: string) => void;
  onServiceSelect: (service: ServiceType) => void;
  onAddAccount: (service: ServiceType) => void;
  isAuthenticating?: boolean;
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
  isAuthenticating = false,
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
          isAuthenticating={isAuthenticating}
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

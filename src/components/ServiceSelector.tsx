"use client";

import React from "react";
import { Button } from "~/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

interface ServiceAccount {
  id: string;
  service: string;
  name?: string;
  email?: string;
}

interface ServiceSelectorProps {
  activeServices: string[];
  serviceAccounts: ServiceAccount[];
  onDisconnectService: (serviceId: string) => void;
  onDisconnectAccount: (serviceId: string, accountId: string) => void;
}

// Helper function to get service display name
const getServiceName = (service: string): string => {
  switch (service) {
    case "google":
      return "Google Drive";
    case "onedrive":
      return "OneDrive";
    case "dropbox":
      return "Dropbox";
    case "box":
      return "Box";
    default:
      return service;
  }
};

export function ServiceSelector({
  activeServices,
  serviceAccounts,
  onDisconnectService,
  onDisconnectAccount,
}: ServiceSelectorProps) {
  if (activeServices.length === 0) {
    return null;
  }

  // Group accounts by service
  const accountsByService = activeServices.reduce<
    Record<string, ServiceAccount[]>
  >((acc, service) => {
    acc[service] = serviceAccounts.filter(
      (account) => account.service === service,
    );
    return acc;
  }, {});

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          <span className="mr-1 capitalize">
            {activeServices
              .map((service) => getServiceName(service))
              .join(", ")}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Connected Services</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {activeServices.map((service) => {
          const accounts = accountsByService[service] ?? [];
          const hasMultipleAccounts = accounts.length > 1;

          return (
            <React.Fragment key={service}>
              {hasMultipleAccounts ? (
                <DropdownMenuSub>
                  <DropdownMenuSubTrigger>
                    <span>{getServiceName(service)}</span>
                  </DropdownMenuSubTrigger>
                  <DropdownMenuSubContent className="w-56 bg-white dark:bg-gray-950">
                    <DropdownMenuLabel>Accounts</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    {accounts.map((account) => (
                      <DropdownMenuItem
                        key={account.id}
                        onClick={() => {
                          // Confirm before disconnecting
                          if (
                            window.confirm(
                              `Are you sure you want to disconnect ${account.email ?? account.name ?? `Account ${account.id}`}?`,
                            )
                          ) {
                            onDisconnectAccount(service, account.id);
                          }
                        }}
                        className="cursor-pointer text-red-500 hover:text-red-700"
                      >
                        Disconnect{" "}
                        {account.email ??
                          account.name ??
                          `Account ${account.id}`}
                      </DropdownMenuItem>
                    ))}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => {
                        // Confirm before disconnecting all accounts
                        if (
                          window.confirm(
                            `Are you sure you want to disconnect all ${getServiceName(service)} accounts?`,
                          )
                        ) {
                          onDisconnectService(service);
                        }
                      }}
                      className="cursor-pointer text-red-500 hover:text-red-700"
                    >
                      Disconnect all {getServiceName(service)} accounts
                    </DropdownMenuItem>
                  </DropdownMenuSubContent>
                </DropdownMenuSub>
              ) : (
                <DropdownMenuItem
                  onClick={() => {
                    // Confirm before disconnecting
                    const accountInfo =
                      accounts.length === 1 && accounts[0]?.email
                        ? ` (${accounts[0].email})`
                        : "";
                    if (
                      window.confirm(
                        `Are you sure you want to disconnect ${getServiceName(service)}${accountInfo}?`,
                      )
                    ) {
                      onDisconnectService(service);
                    }
                  }}
                  className="cursor-pointer text-red-500 hover:text-red-700"
                >
                  Disconnect {getServiceName(service)}
                  {accounts.length === 1 && accounts[0]?.email && (
                    <span className="ml-1 text-xs opacity-70">
                      ({accounts[0].email})
                    </span>
                  )}
                </DropdownMenuItem>
              )}
            </React.Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

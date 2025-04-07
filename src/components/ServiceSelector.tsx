"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

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
  // State for dialog
  const [isOpen, setIsOpen] = useState(false);

  // Memoize the service names to prevent unnecessary re-renders
  const serviceNames = useMemo(() => {
    return activeServices.map((service) => getServiceName(service)).join(", ");
  }, [activeServices]);

  // Group accounts by service - memoized to prevent recalculation on every render
  const accountsByService = useMemo(() => {
    return activeServices.reduce<Record<string, ServiceAccount[]>>(
      (acc, service) => {
        acc[service] = serviceAccounts.filter(
          (account) => account.service === service,
        );
        return acc;
      },
      {},
    );
  }, [activeServices, serviceAccounts]);

  // Handlers with useCallback to prevent unnecessary re-renders
  const handleOpenDialog = useCallback(() => {
    setIsOpen(true);
  }, []);

  const handleCloseDialog = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleDisconnectService = useCallback(
    (service: string) => {
      if (
        window.confirm(
          `Are you sure you want to disconnect ${getServiceName(service)}?`,
        )
      ) {
        onDisconnectService(service);
        setIsOpen(false);
      }
    },
    [onDisconnectService],
  );

  const handleDisconnectAccount = useCallback(
    (service: string, accountId: string, accountName: string) => {
      if (
        window.confirm(`Are you sure you want to disconnect ${accountName}?`)
      ) {
        onDisconnectAccount(service, accountId);
        setIsOpen(false);
      }
    },
    [onDisconnectAccount],
  );

  if (activeServices.length === 0) {
    return null;
  }

  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={handleOpenDialog}
        title="Manage connected services"
      >
        <span className="mr-1 capitalize">{serviceNames}</span>
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Connected Services</DialogTitle>
            <DialogDescription>
              Manage your connected cloud storage services
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            {activeServices.map((service) => {
              const accounts = accountsByService[service] ?? [];
              const hasMultipleAccounts = accounts.length > 1;

              return (
                <div key={service} className="mb-4">
                  <h3 className="mb-2 text-lg font-medium">
                    {getServiceName(service)}
                  </h3>

                  {hasMultipleAccounts ? (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium text-gray-500 dark:text-gray-300">
                        Accounts
                      </h4>
                      {accounts.map((account) => {
                        const accountName =
                          account.email ??
                          account.name ??
                          `Account ${account.id}`;
                        return (
                          <div
                            key={account.id}
                            className="flex items-center justify-between"
                          >
                            <span>{accountName}</span>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                handleDisconnectAccount(
                                  service,
                                  account.id,
                                  accountName,
                                )
                              }
                              className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                            >
                              Disconnect
                            </Button>
                          </div>
                        );
                      })}
                      <div className="pt-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDisconnectService(service)}
                          className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                        >
                          Disconnect all {getServiceName(service)} accounts
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      {accounts.length === 1 && accounts[0]?.email && (
                        <span className="text-sm text-gray-500 dark:text-gray-300">
                          {accounts[0].email}
                        </span>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDisconnectService(service)}
                        className="text-red-500 hover:bg-red-50 hover:text-red-700 dark:hover:bg-red-950"
                      >
                        Disconnect {getServiceName(service)}
                      </Button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseDialog}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

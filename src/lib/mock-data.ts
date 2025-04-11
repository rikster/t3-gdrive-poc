import type { DriveItem } from "~/types/drive";
import type { ServiceType } from "~/types/services";

export const mockDriveData: DriveItem[] = [
  {
    id: "folder1",
    name: "Documents",
    type: "folder",
    modifiedAt: "2025-02-20",
    parentId: "root",
    service: "google" as ServiceType,
  },
  {
    id: "folder2",
    name: "Images",
    type: "folder",
    modifiedAt: "2025-02-19",
    parentId: "root",
    service: "onedrive" as ServiceType,
  },
  {
    id: "file1",
    name: "Project Proposal.pdf",
    type: "file",
    size: "2.5 MB",
    modifiedAt: "2025-02-18",
    parentId: "folder1",
    service: "google" as ServiceType,
  },
  {
    id: "file2",
    name: "Meeting Notes.docx",
    type: "file",
    size: "500 KB",
    modifiedAt: "2025-02-17",
    parentId: "folder1",
    service: "google" as ServiceType,
  },
  {
    id: "file3",
    name: "profile.jpg",
    type: "file",
    size: "1.2 MB",
    modifiedAt: "2025-02-16",
    parentId: "folder2",
    service: "onedrive" as ServiceType,
  },
];

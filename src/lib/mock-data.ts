export interface DriveItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedAt: string;
  parentId: string | null;
}

export const mockDriveData: DriveItem[] = [
  {
    id: 'folder1',
    name: 'Documents',
    type: 'folder',
    modifiedAt: '2025-02-20',
    parentId: 'root',
  },
  {
    id: 'folder2',
    name: 'Images',
    type: 'folder',
    modifiedAt: '2025-02-19',
    parentId: 'root',
  },
  {
    id: 'file1',
    name: 'Project Proposal.pdf',
    type: 'file',
    size: '2.5 MB',
    modifiedAt: '2025-02-18',
    parentId: 'folder1',
  },
  {
    id: 'file2',
    name: 'Meeting Notes.docx',
    type: 'file',
    size: '500 KB',
    modifiedAt: '2025-02-17',
    parentId: 'folder1',
  },
  {
    id: 'file3',
    name: 'profile.jpg',
    type: 'file',
    size: '1.2 MB',
    modifiedAt: '2025-02-16',
    parentId: 'folder2',
  },
];

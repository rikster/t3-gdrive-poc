import { NextResponse } from 'next/server';
import { getActiveServices, getStoredTokens } from '~/lib/session';

// Interface for search results
interface SearchResult {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modifiedAt: string;
  parentId: string | null;
  service: string;
  path?: string; // Path to the file/folder for context
}

// Function to search Google Drive recursively
async function searchGoogleDrive(query: string, token: any): Promise<SearchResult[]> {
  try {
    // Use Google Drive API's search functionality with q parameter
    // This searches across all folders without having to traverse the folder structure
    const searchQuery = `name contains '${query}' and trashed = false`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(searchQuery)}&fields=files(id,name,mimeType,size,modifiedTime,parents)`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Google Drive search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map Google Drive results to our SearchResult interface
    return data.files.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.mimeType === 'application/vnd.google-apps.folder' ? 'folder' : 'file',
      size: file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : undefined,
      modifiedAt: new Date(file.modifiedTime).toLocaleString(),
      parentId: file.parents?.[0] || null,
      service: 'google',
    }));
  } catch (error) {
    console.error('Error searching Google Drive:', error);
    return [];
  }
}

// Function to search OneDrive recursively
async function searchOneDrive(query: string, token: any): Promise<SearchResult[]> {
  try {
    // Use OneDrive API's search functionality
    // This searches across all folders without having to traverse the folder structure
    const response = await fetch(
      `https://graph.microsoft.com/v1.0/me/drive/search(q='${encodeURIComponent(query)}')`,
      {
        headers: {
          Authorization: `Bearer ${token.access_token}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error(`OneDrive search failed: ${response.statusText}`);
    }

    const data = await response.json();
    
    // Map OneDrive results to our SearchResult interface
    return data.value.map((file: any) => ({
      id: file.id,
      name: file.name,
      type: file.folder ? 'folder' : 'file',
      size: file.size ? `${Math.round(file.size / 1024)} KB` : undefined,
      modifiedAt: new Date(file.lastModifiedDateTime).toLocaleString(),
      parentId: file.parentReference?.id || null,
      service: 'onedrive',
    }));
  } catch (error) {
    console.error('Error searching OneDrive:', error);
    return [];
  }
}

export async function GET(request: Request) {
  // Get query parameter
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  
  if (!query) {
    return NextResponse.json({ error: 'Search query is required' }, { status: 400 });
  }

  try {
    // Get active services and their tokens
    const activeServices = await getActiveServices();
    
    if (!activeServices || activeServices.length === 0) {
      return NextResponse.json({ error: 'No active services' }, { status: 401 });
    }

    // Collect search results from all active services
    const searchPromises: Promise<SearchResult[]>[] = [];
    
    for (const service of activeServices) {
      if (service === 'google') {
        const token = await getStoredTokens('google');
        if (token) {
          searchPromises.push(searchGoogleDrive(query, token));
        }
      } else if (service === 'onedrive') {
        const token = await getStoredTokens('onedrive');
        if (token) {
          searchPromises.push(searchOneDrive(query, token));
        }
      }
      // Add more services here as they are implemented
    }

    // Wait for all search operations to complete
    const searchResults = await Promise.all(searchPromises);
    
    // Combine and sort results (folders first, then alphabetically)
    const combinedResults = searchResults.flat().sort((a, b) => {
      // First sort by type (folders first)
      if (a.type === 'folder' && b.type !== 'folder') return -1;
      if (a.type !== 'folder' && b.type === 'folder') return 1;
      
      // Then sort alphabetically by name
      return a.name.localeCompare(b.name);
    });

    return NextResponse.json({ files: combinedResults });
  } catch (error) {
    console.error('Search error:', error);
    return NextResponse.json({ error: 'Failed to search files' }, { status: 500 });
  }
}

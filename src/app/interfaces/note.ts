export interface Note {
    title: string;
    content: string;
    folder: string;
    createdAt: string;
    updatedAt: string | null;
    isBookmarked: boolean;
    docId: string | null ; 
}
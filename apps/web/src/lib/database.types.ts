// Tipos gerados a partir do schema Supabase (projeto whisly).
// Regenerar com: Supabase MCP -> generate_typescript_types.
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: '14.5';
  };
  public: {
    Tables: {
      activity: {
        Row: {
          actor_id: string | null;
          created_at: string;
          id: string;
          list_id: string | null;
          metadata: Json;
          read: boolean;
          type: string;
          user_id: string;
        };
        Insert: {
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          list_id?: string | null;
          metadata?: Json;
          read?: boolean;
          type: string;
          user_id: string;
        };
        Update: {
          actor_id?: string | null;
          created_at?: string;
          id?: string;
          list_id?: string | null;
          metadata?: Json;
          read?: boolean;
          type?: string;
          user_id?: string;
        };
        Relationships: [];
      };
      collaborators: {
        Row: {
          created_at: string;
          id: string;
          list_id: string;
          role: Database['public']['Enums']['collaborator_role'];
          user_id: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          list_id: string;
          role?: Database['public']['Enums']['collaborator_role'];
          user_id: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          list_id?: string;
          role?: Database['public']['Enums']['collaborator_role'];
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'collaborators_list_id_fkey';
            columns: ['list_id'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      list_items: {
        Row: {
          added_by: string | null;
          brand: string | null;
          created_at: string;
          id: string;
          image_url: string | null;
          list_id: string;
          price: string | null;
          status: Database['public']['Enums']['item_status'];
          title: string;
          url: string | null;
        };
        Insert: {
          added_by?: string | null;
          brand?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          list_id: string;
          price?: string | null;
          status?: Database['public']['Enums']['item_status'];
          title: string;
          url?: string | null;
        };
        Update: {
          added_by?: string | null;
          brand?: string | null;
          created_at?: string;
          id?: string;
          image_url?: string | null;
          list_id?: string;
          price?: string | null;
          status?: Database['public']['Enums']['item_status'];
          title?: string;
          url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'list_items_list_id_fkey';
            columns: ['list_id'];
            isOneToOne: false;
            referencedRelation: 'lists';
            referencedColumns: ['id'];
          },
        ];
      };
      lists: {
        Row: {
          cover_image: string | null;
          created_at: string;
          description: string | null;
          id: string;
          owner_id: string;
          privacy: Database['public']['Enums']['list_privacy'];
          title: string;
          updated_at: string;
        };
        Insert: {
          cover_image?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          owner_id: string;
          privacy?: Database['public']['Enums']['list_privacy'];
          title: string;
          updated_at?: string;
        };
        Update: {
          cover_image?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          owner_id?: string;
          privacy?: Database['public']['Enums']['list_privacy'];
          title?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          bio: string | null;
          created_at: string;
          handle: string | null;
          id: string;
          name: string | null;
        };
        Insert: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          handle?: string | null;
          id: string;
          name?: string | null;
        };
        Update: {
          avatar_url?: string | null;
          bio?: string | null;
          created_at?: string;
          handle?: string | null;
          id?: string;
          name?: string | null;
        };
        Relationships: [];
      };
      reservations: {
        Row: {
          created_at: string;
          id: string;
          item_id: string;
          reserved_by: string;
        };
        Insert: {
          created_at?: string;
          id?: string;
          item_id: string;
          reserved_by: string;
        };
        Update: {
          created_at?: string;
          id?: string;
          item_id?: string;
          reserved_by?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reservations_item_id_fkey';
            columns: ['item_id'];
            isOneToOne: true;
            referencedRelation: 'list_items';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      can_edit_list: { Args: { _list_id: string }; Returns: boolean };
      is_list_member: { Args: { _list_id: string }; Returns: boolean };
      is_list_owner: { Args: { _list_id: string }; Returns: boolean };
    };
    Enums: {
      collaborator_role: 'owner' | 'editor' | 'viewer';
      item_status: 'urgent' | 'desired' | 'later' | 'bought';
      list_privacy: 'private' | 'collaborative' | 'public';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row'];
export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];
export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T];

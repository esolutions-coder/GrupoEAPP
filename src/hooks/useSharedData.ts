import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface Worker {
  id: string;
  worker_code: string;
  first_name: string;
  last_name: string;
  full_name?: string;
  dni: string;
  phone?: string;
  email?: string;
  category: string;
  status: string;
  hourly_rate?: number;
  monthly_rate?: number;
  hire_date?: string;
  contract_type?: string;
}

export interface Project {
  id: string;
  code: string;
  name: string;
  client_id?: string;
  client_name?: string;
  status: string;
  start_date?: string;
  end_date?: string;
  location?: string;
  budget?: number;
}

export interface Client {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  cif?: string;
  type: string;
}

export interface Supplier {
  id: string;
  name: string;
  cif: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  type: string;
  payment_terms?: string;
}

export interface Crew {
  id: string;
  name: string;
  supervisor_id?: string;
  supervisor_name?: string;
  description?: string;
  status: string;
  members_count?: number;
}

export const useWorkers = () => {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadWorkers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('workers')
        .select('*')
        .order('first_name');

      if (fetchError) throw fetchError;

      const formattedWorkers = (data || []).map(worker => ({
        ...worker,
        full_name: `${worker.first_name} ${worker.last_name}`
      }));

      setWorkers(formattedWorkers);
    } catch (err) {
      console.error('Error loading workers:', err);
      setError('Error al cargar trabajadores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkers();
  }, []);

  return { workers, loading, error, reload: loadWorkers };
};

export const useProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProjects = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('projects')
        .select(`
          *,
          clients (
            name
          )
        `)
        .order('name');

      if (fetchError) throw fetchError;

      const formattedProjects = (data || []).map(project => ({
        ...project,
        client_name: project.clients?.name
      }));

      setProjects(formattedProjects);
    } catch (err) {
      console.error('Error loading projects:', err);
      setError('Error al cargar proyectos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
  }, []);

  return { projects, loading, error, reload: loadProjects };
};

export const useClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadClients = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      setClients(data || []);
    } catch (err) {
      console.error('Error loading clients:', err);
      setError('Error al cargar clientes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  return { clients, loading, error, reload: loadClients };
};

export const useSuppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadSuppliers = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');

      if (fetchError) throw fetchError;

      setSuppliers(data || []);
    } catch (err) {
      console.error('Error loading suppliers:', err);
      setError('Error al cargar proveedores');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  return { suppliers, loading, error, reload: loadSuppliers };
};

export const useCrews = () => {
  const [crews, setCrews] = useState<Crew[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCrews = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('crews')
        .select(`
          *,
          supervisor:workers!crews_supervisor_id_fkey (
            first_name,
            last_name
          )
        `)
        .order('name');

      if (fetchError) throw fetchError;

      const formattedCrews = (data || []).map(crew => ({
        ...crew,
        supervisor_name: crew.supervisor
          ? `${crew.supervisor.first_name} ${crew.supervisor.last_name}`
          : undefined
      }));

      setCrews(formattedCrews);
    } catch (err) {
      console.error('Error loading crews:', err);
      setError('Error al cargar cuadrillas');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCrews();
  }, []);

  return { crews, loading, error, reload: loadCrews };
};

export const getWorkerById = async (workerId: string): Promise<Worker | null> => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('id', workerId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        ...data,
        full_name: `${data.first_name} ${data.last_name}`
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting worker:', error);
    return null;
  }
};

export const getProjectById = async (projectId: string): Promise<Project | null> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (
          name
        )
      `)
      .eq('id', projectId)
      .maybeSingle();

    if (error) throw error;

    if (data) {
      return {
        ...data,
        client_name: data.clients?.name
      };
    }

    return null;
  } catch (error) {
    console.error('Error getting project:', error);
    return null;
  }
};

export const getClientById = async (clientId: string): Promise<Client | null> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('id', clientId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting client:', error);
    return null;
  }
};

export const getSupplierById = async (supplierId: string): Promise<Supplier | null> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .select('*')
      .eq('id', supplierId)
      .maybeSingle();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error getting supplier:', error);
    return null;
  }
};

export const getActiveWorkers = async (): Promise<Worker[]> => {
  try {
    const { data, error } = await supabase
      .from('workers')
      .select('*')
      .eq('status', 'active')
      .order('first_name');

    if (error) throw error;

    return (data || []).map(worker => ({
      ...worker,
      full_name: `${worker.first_name} ${worker.last_name}`
    }));
  } catch (error) {
    console.error('Error getting active workers:', error);
    return [];
  }
};

export const getActiveProjects = async (): Promise<Project[]> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select(`
        *,
        clients (
          name
        )
      `)
      .in('status', ['En Progreso', 'Planificación'])
      .order('name');

    if (error) throw error;

    return (data || []).map(project => ({
      ...project,
      client_name: project.clients?.name
    }));
  } catch (error) {
    console.error('Error getting active projects:', error);
    return [];
  }
};

import { useEffect, useState } from 'react';
import { usersAPI } from '../services/endpoints.js';
import { useToast } from '../context/ToastContext.jsx';
import Table from '../components/ui/Table.jsx';
import Select from '../components/ui/Select.jsx';
import Loader from '../components/ui/Loader.jsx';
import { useAuth } from '../context/AuthContext.jsx';

export default function Users() {
  const toast = useToast();
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const { data } = await usersAPI.list();
      setUsers(data);
    } catch (e) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleRoleChange = async (id, newRole) => {
    try {
      await usersAPI.updateRole(id, newRole);
      toast.success('Role updated!');
      load();
    } catch (e) {
      toast.error('Failed to update role');
    }
  };

  const columns = [
    { key: 'user_id', label: 'ID', className: 'w-16' },
    { key: 'username', label: 'Username' },
    {
      key: 'role', label: 'Role',
      render: (row) => (
        <div className="w-48">
          <Select
            value={row.role}
            onChange={(e) => handleRoleChange(row.user_id, e.target.value)}
            options={['Admin', 'Sales']}
            disabled={row.username === currentUser.username} // Protect yourself from demoting yourself
          />
        </div>
      )
    }
  ];

  if (loading) return <Loader label="Loading users…" />;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-gray-800">Manage Users</h1>
        <p className="text-sm text-gray-500">Assign roles and privileges to system users.</p>
      </div>
      <Table columns={columns} rows={users} />
    </div>
  );
}
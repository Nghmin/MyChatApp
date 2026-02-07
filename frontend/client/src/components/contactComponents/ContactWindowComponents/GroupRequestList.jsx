import React, { useState, useEffect } from 'react';
import { Check, X, Loader2, Users } from 'lucide-react';

const GroupRequestList = ({ refreshTrigger, myId, onAction }) => {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchInvites = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:5000/friend/friend/group/pending/${myId}`, {
            headers: {'Authorization': `Bearer ${token}`}
        });
        const data = await response.json();
        setGroups(data);
      } catch (err) { console.error(err); }
      finally { setLoading(false); }
    };
    fetchInvites();
  }, [myId,refreshTrigger]);

  const internalHandleAction = (groupId, action , groupName) => {
    onAction(groupId, action , groupName);
  };
  

  if (loading) return <Loader2 className="animate-spin m-auto" />;

  return (
    <div className="p-4 space-y-3">
      {groups.map(group => (
        <div key={group._id} className="bg-white p-4 rounded-xl border flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center text-blue-600">
               {group.avatar ? <img src={group.avatar} className="w-full h-full rounded-lg object-cover"/> : <Users size={24}/>}
            </div>
            <div>
              <h4 className="font-bold text-gray-800">{group.name}</h4>
              <p className="text-[11px] text-gray-500">Mời bởi: {group.admin?.username}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => internalHandleAction(group._id, 'accept' , group.name)} className="p-2 bg-blue-50 text-blue-600 rounded-full hover:bg-blue-600 hover:text-white transition-all"><Check size={18}/></button>
            <button onClick={() => internalHandleAction(group._id, 'decline', group.name)} className="p-2 bg-red-50 text-red-600 rounded-full hover:bg-red-600 hover:text-white transition-all"><X size={18}/></button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default GroupRequestList;
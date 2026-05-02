// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// // React Icons Imports
// import { 
//   FaPhoneAlt, FaWhatsapp, FaGlobe, FaLinkedin, FaInstagram, FaFacebook, FaTwitter 
// } from "react-icons/fa";
// import { MdEmail, MdOutlineLink } from "react-icons/md";
// import { FiPlus, FiTrash2, FiEdit2, FiSave } from "react-icons/fi";

// const ContactDetails = () => {
//   const [links, setLinks] = useState([]);
//   const [currentLink, setCurrentLink] = useState({
//     fieldType: 'Mobile / Phone',
//     title: '',
//     url: ''
//   });
//   const [editIndex, setEditIndex] = useState(null);

//   const fieldOptions = [
//     'Mobile / Phone', 'WhatsApp', 'Email', 'Website', 
//     'LinkedIn', 'Instagram', 'Facebook', 'Twitter', 'Custom URL'
//   ];

//   // Helper function: Field type ke hisaab se Icon return karega
//   const getFieldIcon = (type) => {
//     const iconClass = "w-4 h-4 text-gray-500";
//     switch (type) {
//       case 'Mobile / Phone': return <FaPhoneAlt className={iconClass} />;
//       case 'WhatsApp': return <FaWhatsapp className={iconClass} />;
//       case 'Email': return <MdEmail className="w-5 h-5 text-gray-500" />;
//       case 'Website': return <FaGlobe className={iconClass} />;
//       case 'LinkedIn': return <FaLinkedin className={iconClass} />;
//       case 'Instagram': return <FaInstagram className={iconClass} />;
//       case 'Facebook': return <FaFacebook className={iconClass} />;
//       case 'Twitter': return <FaTwitter className={iconClass} />;
//       case 'Custom URL': return <MdOutlineLink className="w-5 h-5 text-gray-500" />;
//       default: return <MdOutlineLink className="w-5 h-5 text-gray-500" />;
//     }
//   };

//   // Helper function: Field type ke hisaab se sahi href generate karega
//   const getClickableUrl = (type, urlValue) => {
//     // Agar input empty hai
//     if (!urlValue) return "#";
    
//     // Spaces hatane ke liye, khaaskar phone numbers se
//     const cleanUrl = urlValue.trim();

//     switch (type) {
//       case 'Mobile / Phone': 
//         return `tel:${cleanUrl.replace(/[^0-9+]/g, '')}`; // Sirf numbers aur + allow karega
//       case 'WhatsApp': 
//         return `https://wa.me/${cleanUrl.replace(/[^0-9+]/g, '')}`; 
//       case 'Email': 
//         return `mailto:${cleanUrl}`;
//       case 'Website':
//       case 'LinkedIn':
//       case 'Instagram':
//       case 'Facebook':
//       case 'Twitter':
//       case 'Custom URL':
//         // Agar http ya https se shuru nahi hota, toh add kar dega
//         if (!/^https?:\/\//i.test(cleanUrl)) {
//             return `https://${cleanUrl}`;
//         }
//         return cleanUrl;
//       default: 
//         return cleanUrl;
//     }
//   };

//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         const token = localStorage.getItem('token');
//         const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, {
//           headers: { 'x-auth-token': token }
//         });
//         if (res.data && res.data.dynamicLinks) {
//           setLinks(res.data.dynamicLinks);
//         }
//       } catch (error) {
//         console.error("Error fetching links", error);
//       }
//     };
//     fetchData();
//   }, []);

//   const handleAddOrUpdate = () => {
//     if (!currentLink.title || !currentLink.url) {
//       alert("Title and URL are required!");
//       return;
//     }
//     if (editIndex !== null) {
//       const updatedLinks = [...links];
//       updatedLinks[editIndex] = currentLink;
//       setLinks(updatedLinks);
//       setEditIndex(null);
//     } else {
//       setLinks([...links, currentLink]);
//     }
//     setCurrentLink({ fieldType: 'Mobile / Phone', title: '', url: '' });
//   };

//   const handleEdit = (index) => {
//     setCurrentLink(links[index]);
//     setEditIndex(index);
//   };

//   const handleDelete = (index) => {
//     const filteredLinks = links.filter((_, i) => i !== index);
//     setLinks(filteredLinks);
//   };

//   const handleSaveAll = async () => {
//     try {
//       const token = localStorage.getItem('token');
//       await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { dynamicLinks: links }, {
//         headers: { 'x-auth-token': token }
//       });
//       alert('All Links Saved Successfully!');
//     } catch (err) {
//       alert('Error saving links');
//     }
//   };

//   return (
//     <div className="max-w-5xl bg-white p-8 rounded-xl shadow-sm border border-gray-200 font-['Inter']">
//       <div className="mb-8">
//         <h2 className="text-xl font-bold text-black tracking-tight">Contact & Social Links</h2>
//         <p className="text-sm text-gray-500 mt-1">Add your phone numbers, emails, social media, and custom URLs here.</p>
//       </div>

//       {/* Add New Link Section */}
//       <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1.5">Field Type</label>
//             <div className="relative">
//               <div className="absolute left-3 top-2.5">
//                 {getFieldIcon(currentLink.fieldType)}
//               </div>
//               <select 
//                 className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black outline-none text-sm bg-white appearance-none"
//                 value={currentLink.fieldType}
//                 onChange={(e) => setCurrentLink({...currentLink, fieldType: e.target.value})}
//               >
//                 {fieldOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
//               </select>
//             </div>
//           </div>
//           <div>
//             <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
//             <input 
//               type="text" 
//               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black outline-none text-sm"
//               placeholder="e.g. Personal Number"
//               value={currentLink.title}
//               onChange={(e) => setCurrentLink({...currentLink, title: e.target.value})}
//             />
//           </div>
//           <div className="md:col-span-2 flex space-x-3">
//             <div className="flex-1">
//               <label className="block text-xs font-medium text-gray-600 mb-1.5">URL / Number</label>
//               <input 
//                 type="text" 
//                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black outline-none text-sm"
//                 placeholder="https://... or +91..."
//                 value={currentLink.url}
//                 onChange={(e) => setCurrentLink({...currentLink, url: e.target.value})}
//               />
//             </div>
//             <button 
//               onClick={handleAddOrUpdate}
//               className="mt-6 flex items-center justify-center space-x-1 bg-black hover:bg-gray-800 text-white font-medium px-4 rounded-md transition-all text-sm h-[38px] shrink-0"
//             >
//               {editIndex !== null ? <FiEdit2 className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
//               <span>{editIndex !== null ? 'Update' : 'Add'}</span>
//             </button>
//           </div>
//         </div>
//       </div>

//       {/* Links Table */}
//       {links.length > 0 ? (
//         <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
//           <table className="w-full text-left text-sm">
//             <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
//               <tr>
//                 <th className="px-4 py-3 font-medium">Field Type</th>
//                 <th className="px-4 py-3 font-medium">Title</th>
//                 <th className="px-4 py-3 font-medium">URL / Number</th>
//                 <th className="px-4 py-3 font-medium text-right">Action</th>
//               </tr>
//             </thead>
//             <tbody>
//               {links.map((link, index) => (
//                 <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
//                   <td className="px-4 py-3 text-black font-medium">
//                     <div className="flex items-center space-x-2">
//                       {getFieldIcon(link.fieldType)}
//                       <span>{link.fieldType}</span>
//                     </div>
//                   </td>
//                   <td className="px-4 py-3 text-gray-600">{link.title}</td>
//                   {/* Clickable URL Column */}
//                   <td className="px-4 py-3 truncate max-w-xs">
//                     <a 
//                       href={getClickableUrl(link.fieldType, link.url)} 
//                       target="_blank" 
//                       rel="noopener noreferrer"
//                       className="text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center space-x-1"
//                     >
//                       {/* Ek chota sa icon dikhane ke liye ki yeh external link hai */}
//                       <MdOutlineLink className="w-3.5 h-3.5 inline" /> 
//                       <span className="truncate">{link.url}</span>
//                     </a>
//                   </td>
//                   <td className="px-4 py-3 text-right">
//                     <div className="flex items-center justify-end space-x-2">
//                       <button onClick={() => handleEdit(index)} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-200 rounded transition-colors">
//                         <FiEdit2 className="w-4 h-4" />
//                       </button>
//                       <button onClick={() => handleDelete(index)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded transition-colors">
//                         <FiTrash2 className="w-4 h-4" />
//                       </button>
//                     </div>
//                   </td>
//                 </tr>
//               ))}
//             </tbody>
//           </table>
//         </div>
//       ) : (
//         <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg mb-8 bg-gray-50">
//           <MdOutlineLink className="w-8 h-8 text-gray-300 mx-auto mb-2" />
//           <p className="text-sm text-gray-500">No links added yet. Add your first link above.</p>
//         </div>
//       )}

//       {/* Save Button */}
//       <div className="pt-4 flex justify-end">
//         <button onClick={handleSaveAll} className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-8 rounded-md transition-all text-sm">
//           <FiSave className="w-4 h-4" />
//           <span>Save All Links</span>
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ContactDetails;








import React, { useState, useEffect } from 'react';
import axios from 'axios';
// React Icons Imports
import { 
  FaPhoneAlt, FaWhatsapp, FaGlobe, FaLinkedin, FaInstagram, FaFacebook, FaTwitter 
} from "react-icons/fa";
import { MdEmail, MdOutlineLink } from "react-icons/md";
import { FiPlus, FiTrash2, FiEdit2, FiSave } from "react-icons/fi";

// STEP 1: Import Router and Popup
import { useNavigate } from 'react-router-dom';
import ActionPopup from '../../components/ActionPopup';

const ContactDetails = () => {
  // STEP 2: Initiate navigate and popup states
  const navigate = useNavigate();
  const [showPopup, setShowPopup] = useState(false);
  const [slug, setSlug] = useState('');

  const [links, setLinks] = useState([]);
  const [currentLink, setCurrentLink] = useState({
    fieldType: 'Mobile / Phone',
    title: '',
    url: ''
  });
  const [editIndex, setEditIndex] = useState(null);

  const fieldOptions = [
    'Mobile / Phone', 'WhatsApp', 'Email', 'Website', 
    'LinkedIn', 'Instagram', 'Facebook', 'Twitter', 'Custom URL'
  ];

  // Helper function: Field type ke hisaab se Icon return karega
  const getFieldIcon = (type) => {
    const iconClass = "w-4 h-4 text-gray-500";
    switch (type) {
      case 'Mobile / Phone': return <FaPhoneAlt className={iconClass} />;
      case 'WhatsApp': return <FaWhatsapp className={iconClass} />;
      case 'Email': return <MdEmail className="w-5 h-5 text-gray-500" />;
      case 'Website': return <FaGlobe className={iconClass} />;
      case 'LinkedIn': return <FaLinkedin className={iconClass} />;
      case 'Instagram': return <FaInstagram className={iconClass} />;
      case 'Facebook': return <FaFacebook className={iconClass} />;
      case 'Twitter': return <FaTwitter className={iconClass} />;
      case 'Custom URL': return <MdOutlineLink className="w-5 h-5 text-gray-500" />;
      default: return <MdOutlineLink className="w-5 h-5 text-gray-500" />;
    }
  };

  // Helper function: Field type ke hisaab se sahi href generate karega
  const getClickableUrl = (type, urlValue) => {
    if (!urlValue) return "#";
    const cleanUrl = urlValue.trim();

    switch (type) {
      case 'Mobile / Phone': 
        return `tel:${cleanUrl.replace(/[^0-9+]/g, '')}`; 
      case 'WhatsApp': 
        return `https://wa.me/${cleanUrl.replace(/[^0-9+]/g, '')}`; 
      case 'Email': 
        return `mailto:${cleanUrl}`;
      case 'Website':
      case 'LinkedIn':
      case 'Instagram':
      case 'Facebook':
      case 'Twitter':
      case 'Custom URL':
        if (!/^https?:\/\//i.test(cleanUrl)) {
            return `https://${cleanUrl}`;
        }
        return cleanUrl;
      default: 
        return cleanUrl;
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/vcard/me`, {
          headers: { 'x-auth-token': token }
        });
        
        if (res.data) {
          if (res.data.dynamicLinks) {
            setLinks(res.data.dynamicLinks);
          }
          // STEP 3: Slug save kar rahe hain preview ke liye
          if (res.data.username) {
            setSlug(res.data.username);
          }
        }
      } catch (error) {
        console.error("Error fetching links", error);
      }
    };
    fetchData();
  }, []);

  const handleAddOrUpdate = () => {
    if (!currentLink.title || !currentLink.url) {
      alert("Title and URL are required!");
      return;
    }
    if (editIndex !== null) {
      const updatedLinks = [...links];
      updatedLinks[editIndex] = currentLink;
      setLinks(updatedLinks);
      setEditIndex(null);
    } else {
      setLinks([...links, currentLink]);
    }
    setCurrentLink({ fieldType: 'Mobile / Phone', title: '', url: '' });
  };

  const handleEdit = (index) => {
    setCurrentLink(links[index]);
    setEditIndex(index);
  };

  const handleDelete = (index) => {
    const filteredLinks = links.filter((_, i) => i !== index);
    setLinks(filteredLinks);
  };

  const handleSaveAll = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`${import.meta.env.VITE_API_URL}/api/vcard`, { dynamicLinks: links }, {
        headers: { 'x-auth-token': token }
      });
      // STEP 4: Success hone par popup trigger karein (Alert hata diya)
      setShowPopup(true);
    } catch (err) {
      alert('Error saving links');
    }
  };

  // STEP 4 (Cont.): Preview aur Next functions
  const handlePreview = () => {
    setShowPopup(false);
    if (slug) {
      window.open(`/c/${slug}`, '_blank');
    } else {
      alert("Profile URL not found! Please create a profile first.");
    }
  };

  const handleNext = () => {
    setShowPopup(false);
    // YAHAN APNE NEXT TAB KA LINK DAAL LENA (e.g., Products/Services)
    navigate('/dashboard/vcard/products'); 
  };

  return (
    <>
      <div className="max-w-5xl bg-white p-8 rounded-xl shadow-sm border border-gray-200 font-['Inter'] relative">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-black tracking-tight">Contact & Social Links</h2>
          <p className="text-sm text-gray-500 mt-1">Add your phone numbers, emails, social media, and custom URLs here.</p>
        </div>

        {/* Add New Link Section */}
        <div className="bg-gray-50 p-5 rounded-lg border border-gray-200 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Field Type</label>
              <div className="relative">
                <div className="absolute left-3 top-2.5">
                  {getFieldIcon(currentLink.fieldType)}
                </div>
                <select 
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black outline-none text-sm bg-white appearance-none"
                  value={currentLink.fieldType}
                  onChange={(e) => setCurrentLink({...currentLink, fieldType: e.target.value})}
                >
                  {fieldOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 mb-1.5">Title</label>
              <input 
                type="text" 
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black outline-none text-sm"
                placeholder="e.g. Personal Number"
                value={currentLink.title}
                onChange={(e) => setCurrentLink({...currentLink, title: e.target.value})}
              />
            </div>
            <div className="md:col-span-2 flex space-x-3">
              <div className="flex-1">
                <label className="block text-xs font-medium text-gray-600 mb-1.5">URL / Number</label>
                <input 
                  type="text" 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-1 focus:ring-black outline-none text-sm"
                  placeholder="https://... or +91..."
                  value={currentLink.url}
                  onChange={(e) => setCurrentLink({...currentLink, url: e.target.value})}
                />
              </div>
              <button 
                onClick={handleAddOrUpdate}
                className="mt-6 flex items-center justify-center space-x-1 bg-black hover:bg-gray-800 text-white font-medium px-4 rounded-md transition-all text-sm h-[38px] shrink-0"
              >
                {editIndex !== null ? <FiEdit2 className="w-4 h-4" /> : <FiPlus className="w-4 h-4" />}
                <span>{editIndex !== null ? 'Update' : 'Add'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Links Table */}
        {links.length > 0 ? (
          <div className="overflow-x-auto border border-gray-200 rounded-lg mb-8">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Field Type</th>
                  <th className="px-4 py-3 font-medium">Title</th>
                  <th className="px-4 py-3 font-medium">URL / Number</th>
                  <th className="px-4 py-3 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody>
                {links.map((link, index) => (
                  <tr key={index} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3 text-black font-medium">
                      <div className="flex items-center space-x-2">
                        {getFieldIcon(link.fieldType)}
                        <span>{link.fieldType}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{link.title}</td>
                    {/* Clickable URL Column */}
                    <td className="px-4 py-3 truncate max-w-xs">
                      <a 
                        href={getClickableUrl(link.fieldType, link.url)} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline transition-colors flex items-center space-x-1"
                      >
                        <MdOutlineLink className="w-3.5 h-3.5 inline" /> 
                        <span className="truncate">{link.url}</span>
                      </a>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => handleEdit(index)} className="p-1.5 text-gray-500 hover:text-black hover:bg-gray-200 rounded transition-colors">
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button onClick={() => handleDelete(index)} className="p-1.5 text-red-500 hover:text-white hover:bg-red-500 rounded transition-colors">
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10 border border-dashed border-gray-300 rounded-lg mb-8 bg-gray-50">
            <MdOutlineLink className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No links added yet. Add your first link above.</p>
          </div>
        )}

        {/* Save Button */}
        <div className="pt-4 flex justify-end">
          <button onClick={handleSaveAll} className="flex items-center space-x-2 bg-black hover:bg-gray-800 text-white font-medium py-2.5 px-8 rounded-md transition-all text-sm">
            <FiSave className="w-4 h-4" />
            <span>Save All Links</span>
          </button>
        </div>
      </div>

      {/* STEP 5: Add Popup Component here */}
      <ActionPopup 
        isOpen={showPopup} 
        onClose={() => setShowPopup(false)}
        onPreview={handlePreview}
        onNext={handleNext}
      />
    </>
  );
};

export default ContactDetails;
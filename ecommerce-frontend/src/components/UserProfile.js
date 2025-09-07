// frontend/components/UserProfile.js
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateUserProfile } from '../services/userService';

export default function UserProfile({ user }) {
  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      name: user.name,
      email: user.email,
    }
  });
  
  const queryClient = useQueryClient();
  
  const mutation = useMutation(updateUserProfile, {
    onSuccess: () => {
      queryClient.invalidateQueries('user');
      alert('Profile updated successfully');
    }
  });
  
  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  
  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            {...register('name', { required: 'Name is required' })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.name && <p className="text-red-500 text-xs">{errors.name.message}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            {...register('email', { 
              required: 'Email is required',
              pattern: {
                value: /^\S+@\S+$/i,
                message: 'Invalid email address'
              }
            })}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
          {errors.email && <p className="text-red-500 text-xs">{errors.email.message}</p>}
        </div>
        
        <button
          type="submit"
          disabled={mutation.isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
        >
          {mutation.isLoading ? 'Updating...' : 'Update Profile'}
        </button>
      </form>
    </div>
  );
}
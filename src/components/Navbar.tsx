'use client';

import { Icon } from '@iconify/react';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import Link from 'next/link';

const Navbar = () => {
  const { data: session, status } = useSession();
  console.log('Checking if user is logged in');

  return (
    <>
      <div className="flex w-full flex-row px-4 py-4">
        <div className="ml-auto flex h-10 w-10 items-center justify-center rounded-full bg-zinc-700 hover:cursor-pointer">
          {status != 'authenticated' && (
            <Link href={'/api/auth/signin'}>
              <Icon icon="ep:user-filled" className="h-6 w-6 text-zinc-800" />
            </Link>
          )}
          {status === 'authenticated' && (
            <Image
              width={40}
              height={40}
              src={session.user?.image || ''}
              alt={'pfp'}
              className="h-full w-full rounded-full"
            />
          )}
        </div>
      </div>
    </>
  );
};

export default Navbar;
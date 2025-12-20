'use client';

import React, { use, useCallback, useEffect, useMemo, useState } from 'react';

import { UserObject } from 'next-auth';
import { usePathname, useRouter } from 'next/navigation';

import { Box, Tab, Tabs, useTheme } from '@mui/material';

import { useBreadCrumbs } from '@/src/contexts/BreadCrumbsContext';
import { useMenuMode } from '@/src/contexts/users-context/MenuModeContext';

import Iconify from '../Iconify';
import SelectEditMode from '../navigation/SelectEditMode';
import { UserContentProvider } from './context';
import { fetchUserData } from './shared';

interface UserPageProps {
  children: React.ReactNode;
  // Indica que estamos criando um novo usuário (ainda não salvo)
  isCreating?: true;
}

const userCache = new Map<string, Promise<UserObject | null>>();

export default function UserPage({ children, isCreating }: UserPageProps) {
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();

  const { menuMode, toggleMenuMode, isAllowedToEdit } = useMenuMode();

  const userId = pathname.split('/')[2];
  const getUserData = (userId: string) => {
    if (!userCache.has(userId)) {
      userCache.set(userId, fetchUserData(userId));
    }
    return userCache.get(userId)!;
  };

  // Em modo de criação, não carrega dados do usuário
  const userPromise = isCreating ? undefined : getUserData(userId);
  const user = !isCreating && userPromise ? use(userPromise) : null;
  const { setBreadCrumbsTitle } = useBreadCrumbs();

  useEffect(() => {
    if (user) {
      setBreadCrumbsTitle({ title: user.name, pathname: `/users/${user.id}` });
    }
  }, [user, setBreadCrumbsTitle]);

  const tabs = useMemo(
    () => [
      {
        label: 'Informações',
        icon: 'lucide:user',
        path: `/users/${userId}`,
        value: 0,
      },
      // {
      //   label: "Permissões",
      //   icon: "lucide:shield-check",
      //   path: `/users/${userId}/permissions`,
      //   value: 1,
      // },
      {
        label: 'Segurança',
        icon: 'lucide:lock',
        path: `/users/${userId}/credentials`,
        value: 1,
      },
    ],
    [userId]
  );

  const getCurrentTabValue = useCallback(() => {
    // Em modo de criação, mantém sempre na primeira aba
    if (isCreating) return 0;
    const currentTab = tabs.find((tab) => pathname === tab.path);
    return currentTab ? currentTab.value : 0;
  }, [pathname, isCreating, tabs]);

  const [value, setValue] = useState(getCurrentTabValue());

  useEffect(() => {
    setValue(getCurrentTabValue());
  }, [pathname, isCreating, getCurrentTabValue]);

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    // Bloqueia navegação para outras abas enquanto estiver criando
    if (isCreating && newValue !== 0) {
      return;
    }
    setValue(newValue);
    const selectedTab = tabs.find((tab) => tab.value === newValue);
    if (selectedTab) {
      router.push(selectedTab.path);
    }
  };

  function a11yProps(index: number) {
    return {
      id: `user-tab-${index}`,
      'aria-controls': `user-tabpanel-${index}`,
    };
  }

  return (
    <Box sx={{ width: '100%', height: '100%', maxHeight: '100%' }}>
      {/* Container das abas */}
      {/* Tabs Header */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: { xs: 1, sm: 2 },
          p: 2,
          height: 'auto',
          minHeight: 72,
          alignItems: 'center',
        }}
      >
        <Box
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 4px)', md: '1 1 auto' },
            minWidth: 0,
          }}
        >
          <Tabs
            value={value}
            onChange={handleChange}
            aria-label="Abas de gerenciamento de usuário"
            variant="scrollable"
            scrollButtons="auto"
            sx={{
              '& .MuiTabs-indicator': {
                backgroundColor: theme.palette.primary.main,
              },
            }}
          >
            {tabs.map((tab) => (
              <Tab
                key={tab.value}
                icon={<Iconify icon={tab.icon} />}
                iconPosition="start"
                label={tab.label}
                {...a11yProps(tab.value)}
                // Desabilita abas 1 e 2 quando está criando
                disabled={isCreating && tab.value !== 0}
                sx={{
                  textTransform: 'none',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                }}
              />
            ))}
          </Tabs>
        </Box>

        <Box
          sx={{
            flex: { xs: '1 1 100%', sm: '1 1 calc(50% - 4px)', md: '1 1 auto' },
            minWidth: 0,
            display: 'flex',
            justifyContent: { xs: 'flex-start', md: 'flex-end' },
            alignItems: 'center',
          }}
        >
          <SelectEditMode
            sx={{ height: 40, minWidth: 120 }}
            menuMode={menuMode}
            setMenuMode={toggleMenuMode}
            isAllowedToEdit={isAllowedToEdit}
          />
        </Box>
      </Box>

      {/* Content Area - Renderiza os children baseado na rota */}
      <Box
        flexGrow={1}
        sx={{ p: 2, pt: 1, height: 'calc(100% - 72px)', overflow: 'auto' }}
      >
        <UserContentProvider user={user as unknown as UserObject | null}>
          {children}
        </UserContentProvider>
      </Box>
    </Box>
  );
}

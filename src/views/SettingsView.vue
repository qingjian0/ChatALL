<template>
  <v-container class="fill-height">
    <v-layout>
      <v-navigation-drawer permanent class="w-64">
        <v-list>
          <v-list-item @click="$router.push('/settings/bots')">
            <v-list-item-icon>
              <v-icon>mdi-bot</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('settings.bots') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/settings/appearance')">
            <v-list-item-icon>
              <v-icon>mdi-palette</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('settings.appearance') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/settings/account')">
            <v-list-item-icon>
              <v-icon>mdi-account</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('settings.account') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/settings/security')">
            <v-list-item-icon>
              <v-icon>mdi-shield</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('settings.security') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/settings/privacy')">
            <v-list-item-icon>
              <v-icon>mdi-eye</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('settings.privacy') }}</v-list-item-title>
          </v-list-item>
          <v-list-item @click="$router.push('/settings/advanced')">
            <v-list-item-icon>
              <v-icon>mdi-settings</v-icon>
            </v-list-item-icon>
            <v-list-item-title>{{ $t('settings.advanced') }}</v-list-item-title>
          </v-list-item>
        </v-list>
      </v-navigation-drawer>
      
      <v-main>
        <router-view />
      </v-main>
    </v-layout>
  </v-container>
</template>
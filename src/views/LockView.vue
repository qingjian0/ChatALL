<template>

  <div class="lock-view">
     <v-card
      > <v-card-title class="text-h5">App Locked</v-card-title> <v-card-text
        > <v-container
          > <v-text-field
            v-model="password"
            label="Master Password"
            type="password"
            @keyup.enter="unlock"
          /> <v-btn color="primary" @click="unlock"> Unlock </v-btn>
          <p v-if="error" class="text-red"> {{ error }} </p>
           </v-container
        > </v-card-text
      > </v-card
    >
  </div>

</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useSecureStore } from "@/stores/secureStore";

const router = useRouter();
const secureStore = useSecureStore();

const password = ref("");
const error = ref("");

async function unlock() {
  const success = await secureStore.unlock(password.value);
  if (success) {
    router.push({ name: "Home" });
  } else {
    error.value = "Invalid password";
    password.value = "";
  }
}
</script>

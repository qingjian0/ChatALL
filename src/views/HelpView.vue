<template>

  <div class="help-view">
     <v-card
      > <v-card-title class="text-h5">Help & Support</v-card-title> <v-card-text
        > <v-container
          > <v-card-title class="text-h6">Getting Started</v-card-title>
          <p>Welcome to ChatALL! Here's how to get started:</p>

          <ol>

            <li>Select AI bots from the footer menu</li>

            <li>Configure bot settings in Settings > Bots</li>

            <li>Start chatting!</li>

          </ol>
           <v-divider class="my-4" /> <v-card-title class="text-h6"
            >FAQs</v-card-title
          > <v-expansion-panel
            > <v-expansion-panel-content title="How do I add a bot?"
              >
              <p>
                Click on the bot icon in the footer and select the bot you want
                to add.
              </p>
               </v-expansion-panel-content
            > <v-expansion-panel-content
              title="How do I configure bot settings?"
              >
              <p>
                Go to Settings > Bots and select the bot you want to configure.
              </p>
               </v-expansion-panel-content
            > <v-expansion-panel-content title="How do I delete a chat?"
              >
              <p>Right-click on the chat in the sidebar and select Delete.</p>
               </v-expansion-panel-content
            > </v-expansion-panel
          > <v-divider class="my-4" /> <v-card-title class="text-h6"
            >Contact</v-card-title
          >
          <p>For support, please visit our GitHub repository.</p>
           </v-container
        > </v-card-text
      > </v-card
    >
  </div>

</template>

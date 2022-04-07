<template>
  <div class="home">
    <v-container>
      <v-row class="mt-16">
        <v-col cols="12" class="ma-auto">
          <div
            class="text-center text-h4 font-bold font-weight-bold black--text ma-16"
          >
            Get Started with 4EVERLAND
          </div>
          <!-- <div
            class="text-center text-Subtitle-2 font-weight-bold grey--text text--lighten-1 ma-16"
          >
            Open your web3.0 cloud computing door
          </div> -->
          <div class="wallet-box ma-auto black--text text-center py-16">
            <div class="text-h6 font-weight-bold mb-8">Login to 4EVERLAND</div>
            <div
              class="text-Subtitle-2 font-weight-bold grey--text text--lighten-1 mb-16"
            >
              Connect your wallet to access the 4EVERLAND.
            </div>
            <v-btn
              class="d-block start-btn ma-auto px-10 text-Subtitle-2 font-weight-bold white--text mb-4"
              x-large
              @click="connectOverlay = true"
              >Connect Wallet</v-btn
            >
            <v-btn
              class="d-block ma-auto font-weight-bold"
              plain
              text
              color="#666"
              @click="onLogin"
              >Continue with GitHub</v-btn
            >
          </div>
        </v-col>
        <!-- <v-col cols="12" md="6" lg="6">
          <div class="ma-16">
            <div
              v-for="(item, index) in iconList"
              :key="index"
              class="d-flex align-center my-14"
            >
              <v-img :src="item.img" width="100" class="flex-grow-0"></v-img>
              <div class="ml-16">
                <span class="d-block text-h6 font-weight-bold mb-4">{{
                  item.name
                }}</span>
                <span
                  class="d-block text-Subtitle-2 font-weight-bold grey--text text--lighten-1"
                  >{{ item.text }}</span
                >
              </div>
            </div>
          </div>
        </v-col> -->
      </v-row>
    </v-container>
    <v-dialog v-model="connectOverlay" width="500">
      <div class="connect-box pa-8">
        <div class="text-h5 font-weight-black purple-color mb-5">
          Connect Wallet
        </div>
        <div class="text-caption grey--text text--darken-2 mb-7">
          After connecting to your wallet, you'll be able to make changes in
          custom settings. Pleses select the Ethereum Mainnet network.
        </div>
        <div class="d-flex justify-space-between align-center">
          <div class="d-flex align-center">
            <v-img
              max-height="36"
              max-width="36"
              :src="require('@/assets/imgs/metamask.png')"
            ></v-img>
            <span class="text-subtitle-1 font-weight-black purple-color ml-3"
              >MetaMask</span
            >
          </div>
          <v-btn
            class="start-btn text-subtitle-1 font-weight-black px-10 white--text"
            @click="connect"
            >Connect</v-btn
          >
        </div>
      </div>
    </v-dialog>
    <v-dialog v-model="gitOverlay" width="500">
      <div class="connect-box pa-14">
        <div class="text-caption grey--text text--darken-2 mb-7">
          New Github accounts will no longer be supported, please connect your
          wallet to login instead.
        </div>
        <v-btn
          class="start-btn text-subtitle-1 font-weight-black px-10 white--text"
          @click="gitOverlay = false"
          >OK</v-btn
        >
      </div>
    </v-dialog>
    <v-dialog v-model="lockOverlay" width="500">
      <div class="connect-box pa-14">
        <div class="text-caption grey--text text--darken-2 mb-7">
          Metamask is locked, please open the extension before continuing.
        </div>
        <v-btn
          class="start-btn text-subtitle-1 font-weight-black px-10"
          @click="lockOverlay = false"
          >RETRY</v-btn
        >
      </div>
    </v-dialog>
  </div>
</template>
<script>
import contracts from "@/contracts";

const authApi = process.env.VUE_APP_AUTH_URL;
const BUCKET_HOST = process.env.VUE_APP_BUCKET_HOST;
export default {
  name: "Home",
  components: {},
  data() {
    return {
      connectOverlay: false,
      gitOverlay: false,
      lockOverlay: false,
      accounts: "",
      inviteCode: null,
      iconList: [
        {
          img: require("@/assets/imgs/home/icon_01.png"),
          name: "Secruity",
          text: "Protection against DDoS attacks",
        },
        {
          img: require("@/assets/imgs/home/icon_02.png"),
          name: "Performance",
          text: "Global CDN web optimization",
        },
        {
          img: require("@/assets/imgs/home/icon_03.png"),
          name: "Reliability",
          text: "Always availble and online",
        },
        {
          img: require("@/assets/imgs/home/icon_04.png"),
          name: "Insights",
          text: "Built in analytics and more",
        },
      ],
    };
  },
  created() {
    const code = this.$route.query.code;
    const inviteCode = this.$route.query.inviteCode;
    console.log(this.$route);
    if (inviteCode) {
      this.inviteCode = inviteCode;
    }
    if (code) {
      this.getAuth(code);
    }
  },
  methods: {
    async onLogin() {
      try {
        const params = {
          platform: "github",
          appName: "BUCKET",
          entrance: 2,
          inviteCode: this.inviteCode,
        };
        const { data } = await this.$axios.get(`${authApi}/login`, {
          params,
        });
        location.href = data.data.login_url;
      } catch (error) {
        console.log(error);
      }
    },
    async getAuth(code) {
      try {
        const { data } = await this.$axios.post(`${authApi}/auth/${code}`, {
          inviteCode: this.inviteCode,
        });
        if (data.code === 430) {
          this.gitOverlay = true;
        }
        if (data.code === 200 && data.data.stoken) {
          location.href = `${BUCKET_HOST}/login?stoken=${data.data.stoken}`;
        }
      } catch (error) {
        console.log(error);
      }
    },
    async connect() {
      if (!window.ethereum) {
        window.open("https://metamask.io/download.html", "_blank");
        return;
      }

      const isUnlocked = await window.ethereum._metamask.isUnlocked();
      if (!isUnlocked) {
        console.log("Metamask has been locked, please unlock it.");
        this.connectOverlay = false;
        this.lockOverlay = true;
        return;
      }

      let accounts = await window.ethereum.request({
        method: "eth_accounts",
      });
      if (accounts.length === 0) {
        accounts = await window.ethereum.request({
          method: "eth_requestAccounts",
        });
      }

      this.$axios.get(`${authApi}/web3code/${accounts[0]}`).then((res) => {
        console.log(res);
        this.accounts = accounts[0];
        this.sign(res.data.data.nonce);
      });
      //   window.location.reload();
    },
    async sign(nonce) {
      try {
        const accounts = this.accounts;
        this.msg = nonce;
        const signature = await contracts.signer.signMessage(this.msg);
        const data = {
          signature,
          appName: "BUCKET",
          inviteCode: this.inviteCode,
        };
        this.$axios
          .post(`${authApi}/web3login/${accounts}`, data)
          .then((res) => {
            if (res.data.data.stoken) {
              location.href = `${BUCKET_HOST}/login?stoken=${res.data.data.stoken}`;
            }
          });
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
<style lang="less" scoped>
.home {
  .wallet-box {
    background: linear-gradient(150deg, #e1f2ff, #fff6f6);
    border-radius: 10px;
    max-width: 50%;
    margin: 0 auto;
    .start-btn {
      background: linear-gradient(90deg, #fdb6fe, #acc0fd, #31adfe);
      border-radius: 44px;
    }
  }
}
.connect-box {
  width: 500px;
  min-height: 200px;
  background-color: #fff;
  border-radius: 15px;
  text-align: center;
  margin: 0 auto;
  .start-btn {
    background: linear-gradient(90deg, #fdb6fe, #acc0fd, #31adfe);
    border-radius: 44px;
  }
}
</style>

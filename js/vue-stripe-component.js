const store = new Vuex.Store({
    state: {
        item1: {
            image: 'img/bears.jpg',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
            price: 1299
        },
        item2: {
            image: 'img/pandas.jpg',
            description: 'Magna minim tempor eiusmod reprehenderit cillum adipisicing elit incididunt. Minim ex incididunt anim consequat nisi aute do mollit. Ipsum proident esse consectetur anim ullamco dolor id labore magna incididunt enim occaecat ut aute sit magna.',
            price: 1999
        },
        stripe_token: {},
        stripe_instance: {},
        order_status: 'READY'
    }
})

const itemComponent = Vue.component('item-component', {
	template: '#item-template',

    props: ['identifier'],

    computed: {
        image () {
            return store.state['item' + this.identifier].image
        },
        description () {
            return store.state['item' + this.identifier].description
        },
        price () {
            return store.state['item' + this.identifier].price
        },
        stripe_token () {
            return store.state.stripe_token
        },
        stripe_instance () {
            return store.state.stripe_instance
        }
},
    store: store,
    mounted: function () {
        var instance = this;
        store.state.stripe_instance = StripeCheckout.configure({
            key: 'pk_test_FGNm2dFi9gHpxGB0OCsTI8vd',    //put your own publishable key here
            image: 'https://scontent.flhr2-2.fna.fbcdn.net/v/t1.0-9/971181_186600011495788_1725648979_n.png?_nc_cat=111&_nc_sid=85a577&_nc_ohc=TQrq9ooANCUAX8H--Zt&_nc_ht=scontent.flhr2-2.fna&oh=04c719462abba0243bc926f34902d1f3&oe=5EA12346',
            locale: 'auto',
            token: function(token) {
                console.log('got a token. sending data to localhost');
                store.state.stripe_token = token;
                instance.sendData2Server()
            }
        });
    },
    methods: {
        purchaseStuff: function () {
            store.state.stripe_instance.open({
                name: 'Riccardo Andreatta',
                description: 'Riccardo Andreatta direct payment',
                currency: 'GBP',
                amount: store.state['item' + this.identifier].price
            })
            console.log('attempting to get a token');
        },
        sendData2Server: function () {
//            console.log(this.stripe_token);
            store.state.order_status= "PENDING";

            this.$http.post('/process_payment', {
                token_id: store.state.stripe_token.id,
                price: store.state['item' + this.identifier].price
            }).then((response) => {
                console.log(response.body);
                store.state.order_status= "SUCCESSFULLY COMPLETED";
            },(response) => {
                // error callback
                console.log(response.body);
                store.state.order_status= "FAILED";
            });
        }
    }
})

var myApp = new Vue({
    el: '#app',
    components: {
        itemComponent
    },
    computed: {
        order_status () {
            return store.state.order_status
        }
    }
})

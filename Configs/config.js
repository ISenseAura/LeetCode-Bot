module.exports = {
    token: 'Your Token',
    prefix: '$',
    devs: '272799166756028416',
    embedcolor: '',
    database: '',
    FACT_API: '',
    AME_API: '',
    isDev : function(user) {
        if(typeof user == "string") {
            if(user == '272799166756028416' || user == this.devs) return true;
            return false;
        }
        if(user.id == '272799166756028416' || user.id == this.devs) return true;
        return false;

    }
}

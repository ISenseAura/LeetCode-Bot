let { LeetCode } = require("leetcode-query");
const leetcode = new LeetCode();
console.log(leetcode);

class LC {

     async getUser(username) {
        let user = await leetcode.get_user(username);
return user;
    }

    async getSubmissions(username) {
        let user = await leetcode.get_user(username);
return user.recentSubmissionList;
    }


    

}
let lc = new LC()
let a =  lc.getUser("username");
a.then((b) => {
    console.log(b)
})

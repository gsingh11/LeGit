import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';

/*
  Generated class for the RestProvider provider.

  See https://angular.io/guide/dependency-injection for more info on providers
  and Angular DI.
*/
@Injectable()
export class RestProvider {

  accessToken: any;
  baseUrl = "https://api.github.com/";
  client_id = "4ccf1809d7b59ac518f3";
  client_secret = "4f429876e6f09a56304989eb4f0f45255361b38b";

  constructor(public http: HttpClient, private storage: Storage) {
    console.log('Hello RestProvider Provider');
  }

  setAccessToken(str) {
    var quesIndex = str.indexOf("?") + 1;
    var hashIndex = str.indexOf("#");
    var paramstr = str.substring(quesIndex, hashIndex);
    var paramstrArr = paramstr.split('&');
    var params: any = {};
    paramstrArr.forEach((item) => { return params[item.split('=')[0]] = item.split('=')[1]; });
    return this.getAccessToken(params.code);
  }

  getAccessToken(code) {
    return this.storage.get('accessToken').then((accessToken) => {
      console.log("Access Token: " + accessToken);
      if (accessToken && accessToken != "") {
        this.accessToken = accessToken;
        return this.accessToken;
      } else {
        let body = new HttpParams();
        let headers = new HttpHeaders({ "Accept": "application/json" });
        // headers.set("Accept", "application/json")
        // headers.set("ContentType", "application/json")
        body = body.set('client_id', this.client_id);
        body = body.set('client_secret', this.client_secret);
        body = body.set('code', code);
        var url = 'http://localhost:8100/login/oauth/access_token?client_id=';
        url = url + this.client_id + '&client_secret=' + this.client_secret + '&code=' + code;
        return this.http.post(url, null, { headers: headers }).toPromise().then((res: any) => {
          console.log(res);
          if (res.access_token) {
            this.accessToken = res.access_token;
            this.storage.set('accessToken', this.accessToken);
            return this.accessToken;
          } else {
            return false;
          }
        });
      }
    });
  }

  getUser() {
    return this.invokeService("user", "get");
  }

  getOrganizations() {
    return this.invokeService("user/orgs", "get");
  }

  getRepo(org) {
    return this.invokeService("orgs/" + org + "/repos", "get");
  }

  getBranches(author, repo) {
    return this.invokeService("repos/" + author + "/" + repo + "/branches", "get");
  }

  getCommits(author, organization, repo, data) {
    console.log(organization);
    var since = data.since + 'T00:00:00';
    var until = data.until + 'T23:59:59';
    var url = "repos/" + organization + "/" + repo + "/commits?author=" + author + "&sha=" + data.sha + "&since=" + since + "&until=" + until;
    return this.invokeService(url, "get");
  }

  invokeService(endpoint, method) {
    return this.getAccessToken("").then(res => {
      let headers = new HttpHeaders({ "Authorization": "Bearer " + this.accessToken });
      return this.http[method](this.baseUrl + endpoint, { headers: headers }).toPromise().then((res: any) => {
        console.log(res);
        return res;
      });
    });
  }

}

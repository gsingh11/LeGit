import { Component, OnInit } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { RestProvider } from '../../providers/rest/rest';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import * as moment from 'moment';

/**
 * Generated class for the HomePage page.
 *
 * See https://ionicframework.com/docs/components/#navigation for more info on
 * Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage implements OnInit {

  searchForm: FormGroup;
  orgList: any[] = [];
  repoList: any[] = [];
  branchList: any[] = [];
  groupedCommits: any[] = []
  userProfile: any = {};
  searchData: any = {};
  organization: any;
  repo: any;
  commitCount: any = 0;

  constructor(public navCtrl: NavController, public restProvider: RestProvider, public navParams: NavParams) {
  }

  ngOnInit() {
    var start = moment().lang('en-gb').startOf('week');
    var end = moment().lang('en-gb').endOf('week');
    console.log(start.toISOString());
    console.log(end.toISOString());
    this.searchForm = new FormGroup({
      author: new FormControl({ value: null, disabled: true }, [Validators.required]),
      organization: new FormControl(null, [Validators.required]),
      repo: new FormControl(null, [Validators.required]),
      sha: new FormControl(null, [Validators.required]),
      since: new FormControl(null),
      until: new FormControl(null)
    });
    this.searchData.since = start.toISOString();
    this.searchData.until = end.toISOString();
  }

  ionViewDidLoad() {
  }

  ionViewDidEnter() {
    this.getUserProfile();
    this.getUserOrganizations();
  }

  getUserProfile() {
    this.restProvider.getUser().then(res => {
      this.userProfile = res;
      this.searchData.author = this.userProfile.login;
    }).catch(err => console.log(err));
  }

  getUserOrganizations() {
    this.restProvider.getOrganizations().then(res => this.orgList = res).catch(err => console.log(err));;
  }

  getOrgsRepo() {
    this.repo = null;
    this.searchData.sha = null;
    this.repoList = [];
    this.branchList = [];
    this.groupedCommits = [];
    this.restProvider.getRepo(this.organization).then(res => this.repoList = res).catch(err => console.log(err));;
  }

  getRepoBranches() {
    this.searchData.sha = null;
    this.groupedCommits = [];
    this.restProvider.getBranches(this.organization, this.repo).then(res => this.branchList = res).catch(err => console.log(err));
  }

  getCommits() {
    console.log(this.searchData);
    this.restProvider.getCommits(this.userProfile.login, this.organization, this.repo, this.searchData)
    .then(res => {
      var commits = res;
      this.commitCount = commits.length;
      this.groupedCommits = this.group(commits, "date");
    }).catch(err => console.log(err));
  }

  group(data, column) {
      var generatedData = [];
      data.forEach(function (dt) {
          var key = dt.commit.committer[column];
          key = moment(key).format("DD-MM-YYYY");
          if (!(key in generatedData)) {
              generatedData.push(key);
              generatedData[key] = [];
          }
          generatedData[key].push(dt);
      });
      return generatedData;
  }

  // copyToClipboard(){
  //   var copyText: any = document.getElementById("copyText");
  //   console.log(copyText);
  //   copyText.select();
  //   document.execCommand("copy");
  // }
}

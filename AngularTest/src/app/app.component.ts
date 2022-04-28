import { HttpClient } from '@angular/common/http';
import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { MatSort, Sort } from '@angular/material/sort';

export interface User {
  name: string;
  age: number,
  registered: Date,
  email: string,
  balance: number
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent {
  title = 'Craig\'s Angular Test';
  users = new Array<User>();
  usersDataSource = this.createDataSource();
  displayedColumns: string[] = ['name', 'age', 'registered', 'email', 'balance'];

  constructor(private http: HttpClient, private _liveAnnouncer: LiveAnnouncer) {
  }

  @ViewChild(MatSort) sort = new MatSort();

  ngAfterViewInit() {
    this.getUserData();
    this.usersDataSource.sort = this.sort;
  }

  getUserData() {
    this.http.get<User[]>("/assets/users.json")
      .subscribe(loadedUsers => {
        this.users = loadedUsers.sort((a, b) => a.name.localeCompare(b.name));
        this.users.forEach(user => {
          // Correct types
          user.registered = new Date((user.registered as unknown as string).replace(' ', ''));
          user.balance = parseFloat((user.balance as unknown as string).replace(',', ''));
        });

        this.usersDataSource.data = this.users;
      });
  }

  createDataSource() {
    const dataSource = new MatTableDataSource(this.users);
    dataSource.filterPredicate = (data, filter: string): boolean => {
      return data.name.toLowerCase().indexOf(filter.toLowerCase()) !== -1;
    };

    return dataSource;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.usersDataSource.filter = filterValue.trim().toLowerCase();
  }

  zeroPad(num: number, size: number): string {
    let s = num + '';
    while (s.length < size) {
      s = '0' + s;
    }

    return s;
  }

  formatDate(d: Date): string {
    // Assume UTC date since no region is specified
    const date = new Date(d.getTime() + d.getTimezoneOffset() * 60000);

    return `${this.zeroPad(date.getDate(), 2)}-${this.zeroPad(date.getMonth() + 1, 2)}-${this.zeroPad(date.getFullYear(), 2)} ${this.zeroPad(date.getHours(), 2)}:${this.zeroPad(date.getMinutes(), 2)}:${this.zeroPad(date.getSeconds(), 2)} UTC`;
  }

  resetBalance() {
    this.users.forEach(user => user.balance = 0);
  }

  announceSortChange(sortState: Sort) {
    // This example uses English messages. If your application supports
    // multiple language, you would internationalize these strings.
    // Furthermore, you can customize the message to add additional
    // details about the values being sorted.
    if (sortState.direction) {
      this._liveAnnouncer.announce(`Sorted ${sortState.direction}ending`);
    } else {
      this._liveAnnouncer.announce('Sorting cleared');
    }
  }
}

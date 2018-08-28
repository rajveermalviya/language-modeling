# For Web Serving

## [See it working!](https://nxt-word.firebaseapp.com)

First of all it is necessary that you already have :

* tensorflowjs model in the ```/web/src/web_model``` directory
* nodejs & npm installed

## Usage

Ensure that you are in the ```/web``` directory then run :

```powershell
npm install
```

Once the dependencies are installed run :

```powershell
npm run build
```

Then you will notice that ```bundle.js``` is created in ```/src``` directory.

To serve the ```/src``` directory to the local host run :

```powershell
npm run serve
```

## [License MIT © Rajveer Malviya](https://github.com/rajveermalviya/language-modeling/blob/master/LICENSE.md)
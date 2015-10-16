If another person has pushed to the same branch as you, Git won't be able to push your changes:

``` command-line
$ git push origin master
> To https://{{ site.data.variables.command_line.codeblock }}/<em>USERNAME</em>/<em>REPOSITORY</em>.git
>  ! [rejected]        master -> master (non-fast-forward)
> error: failed to push some refs to 'https://{{ site.data.variables.command_line.codeblock }}/<em>USERNAME</em>/<em>REPOSITORY</em>.git'
> To prevent you from losing history, non-fast-forward updates were rejected
> Merge the remote changes (e.g. 'git pull') before pushing again.  See the
> 'Note about fast-forwards' section of 'git push --help' for details.
```

You can fix this by [fetching and merging](/articles/fetching-a-remote) the changes made on the remote branch with the changes that you have made locally:

``` command-line
$ git fetch origin
# Fetches updates made to an online repository
$ git merge origin <em>YOUR_BRANCH_NAME</em>
# Merges updates made online with your local work
```

Or, you can simply use `git pull` to perform both commands at once:

``` command-line
$ git pull origin <em>YOUR_BRANCH_NAME</em>
# Grabs online updates and merges them with your local work
```

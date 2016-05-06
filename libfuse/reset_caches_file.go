package libfuse

import (
	"bazil.org/fuse"
	"bazil.org/fuse/fs"
	"github.com/keybase/kbfs/libkbfs"
	"golang.org/x/net/context"
)

// ResetCachesFileName is the name of the KBFS cache-resetting file --
// it can be reached anywhere within the mount.
const ResetCachesFileName = ".kbfs_reset_caches"

// ResetCachesFile represents a write-only file where any write of at
// least one byte triggers the resetting of all data caches.  Note
// that it does not clear the *node* cache, which means that the
// BlockPointers for existing nodes are still cached, such that
// directory listings can still be implicitly cached for nodes still
// being held by the kernel.
type ResetCachesFile struct {
	fs *FS
}

var _ fs.Node = (*ResetCachesFile)(nil)

// Attr implements the fs.Node interface for ResetCachesFile.
func (f *ResetCachesFile) Attr(ctx context.Context, a *fuse.Attr) error {
	a.Size = 0
	a.Mode = 0222
	return nil
}

var _ fs.Handle = (*ResetCachesFile)(nil)

var _ fs.HandleWriter = (*ResetCachesFile)(nil)

// Write implements the fs.HandleWriter interface for ResetCachesFile.
func (f *ResetCachesFile) Write(ctx context.Context, req *fuse.WriteRequest,
	resp *fuse.WriteResponse) (err error) {
	f.fs.log.CDebugf(ctx, "ResetCachesFile Write")
	defer func() { f.fs.reportErr(ctx, libkbfs.WriteMode, err) }()
	if len(req.Data) == 0 {
		return nil
	}
	f.fs.config.ResetCaches()
	resp.Size = len(req.Data)
	return nil
}
